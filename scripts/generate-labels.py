#!/usr/bin/env python3
"""Generate vial label PNG files for Purpose Labs peptide products."""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../public/3d")

# Canvas dimensions
W, H = 3600, 1200
NAVY = (27, 42, 74, 255)
TRANSPARENT = (0, 0, 0, 0)

# Font paths (macOS)
SERIF_PATHS = [
    "/System/Library/Fonts/Supplemental/Georgia.ttf",
    "/Library/Fonts/Georgia.ttf",
]
SANS_PATHS = [
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
]

def load_font(paths, size):
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_label(filename, product_name, dosage):
    img = Image.new("RGBA", (W, H), TRANSPARENT)
    draw = ImageDraw.Draw(img)

    # Fonts
    font_logo = load_font(SERIF_PATHS, 140)
    font_name = load_font(SERIF_PATHS, 160)
    font_name_small = load_font(SERIF_PATHS, 120)
    font_dosage = load_font(SERIF_PATHS, 90)
    font_tag = load_font(SANS_PATHS, 72)

    cy = H // 2  # vertical center

    # Layout: estimate heights
    # PL logo
    logo_text = "PL"
    logo_bbox = draw.textbbox((0, 0), logo_text, font=font_logo)
    logo_h = logo_bbox[3] - logo_bbox[1]

    # Product name (may need smaller font if long)
    fn = font_name if len(product_name) <= 12 else font_name_small
    name_bbox = draw.textbbox((0, 0), product_name, font=fn)
    name_h = name_bbox[3] - name_bbox[1]

    # Dosage pill
    dosage_bbox = draw.textbbox((0, 0), dosage, font=font_dosage)
    dosage_h = dosage_bbox[3] - dosage_bbox[1]

    # Tag line
    tag_text = "RESEARCH USE ONLY"
    tag_bbox = draw.textbbox((0, 0), tag_text, font=font_tag)
    tag_h = tag_bbox[3] - tag_bbox[1]

    gap = 220
    pill_pad_x = 60
    pill_pad_y = 28

    total_h = logo_h + gap + name_h + gap + (dosage_h + pill_pad_y * 2) + gap + tag_h
    y = cy - total_h // 2

    def draw_centered(text, font, y_pos):
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        draw.text(((W - tw) // 2, y_pos), text, fill=NAVY, font=font)
        return bbox[3] - bbox[1]

    # 1. PL logo
    h = draw_centered(logo_text, font_logo, y)
    y += h + gap

    # 2. Product name
    h = draw_centered(product_name, fn, y)
    y += h + gap

    # 3. Dosage pill
    d_bbox = draw.textbbox((0, 0), dosage, font=font_dosage)
    dw = d_bbox[2] - d_bbox[0]
    dh = d_bbox[3] - d_bbox[1]
    pill_x0 = (W - dw) // 2 - pill_pad_x
    pill_y0 = y
    pill_x1 = (W + dw) // 2 + pill_pad_x
    pill_y1 = y + dh + pill_pad_y * 2
    radius = (pill_y1 - pill_y0) // 2
    draw.rounded_rectangle([pill_x0, pill_y0, pill_x1, pill_y1], radius=radius, outline=NAVY, width=6)
    # True center of pill, draw text anchored at its midpoint
    pill_center_x = W // 2
    pill_center_y = (pill_y0 + pill_y1) // 2
    draw.text((pill_center_x, pill_center_y), dosage, fill=NAVY, font=font_dosage, anchor="mm")
    y = pill_y1 + gap

    # 4. Research use only
    draw_centered(tag_text, font_tag, y)

    out_path = os.path.join(OUTPUT_DIR, filename)
    img.save(out_path, "PNG")
    print(f"Saved: {out_path}")

PRODUCTS = [
    ("label-bpc157.png",  "BPC-157",              "10 MG"),
    ("label-tb500.png",   "TB-500",               "10 MG"),
    ("label-cjc1295.png", "CJC-1295 + IPAMORELIN","5MG / 5MG"),
    ("label-mt2.png",     "MT-2",                 "10 MG"),
    ("label-semax.png",   "SEMAX",                "10 MG"),
    ("label-selank.png",  "SELANK",               "10 MG"),
]

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for fname, name, dosage in PRODUCTS:
        draw_label(fname, name, dosage)
    print("Done!")
