#!/usr/bin/env python3
"""Generate vial label PNG files for Purpose Labs peptide products."""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../public/3d")
LOGO_PATH  = os.path.join(os.path.dirname(__file__), "../public/3d/pl-logo.png")

W, H = 3600, 1200
NAVY = (27, 42, 74, 255)
TRANSPARENT = (0, 0, 0, 0)

HN = "/System/Library/Fonts/HelveticaNeue.ttc"
# Helvetica Neue indices: 0=Regular, 1=Bold, 7=Light
HN_REGULAR = (HN, 0)
HN_LIGHT   = (HN, 7)

def load_font(path, index, size):
    return ImageFont.truetype(path, size, index=index)

def draw_label(filename, product_name, dosage):
    img  = Image.new("RGBA", (W, H), TRANSPARENT)
    draw = ImageDraw.Draw(img)

    font_name   = load_font(*HN_REGULAR, 160) if len(product_name) <= 12 else load_font(*HN_REGULAR, 120)
    font_dosage = load_font(*HN_REGULAR, 72)
    font_tag    = load_font(*HN_LIGHT,   72)

    pill_pad_x = 60
    pill_pad_y = 28

    # Load and scale the PL logo
    logo_img = Image.open(LOGO_PATH).convert("RGBA")
    logo_target_h = 320
    logo_scale = logo_target_h / logo_img.height
    logo_w = int(logo_img.width * logo_scale)
    logo_img = logo_img.resize((logo_w, logo_target_h), Image.LANCZOS)

    # Measure text elements
    name_bb = draw.textbbox((0,0), product_name,        font=font_name)
    dose_bb = draw.textbbox((0,0), dosage,              font=font_dosage)
    tag_bb  = draw.textbbox((0,0), "RESEARCH USE ONLY", font=font_tag)

    name_h = name_bb[3] - name_bb[1]
    dose_h = dose_bb[3] - dose_bb[1]
    tag_h  = tag_bb[3]  - tag_bb[1]
    pill_h = dose_h + pill_pad_y * 2

    # Fit all 4 elements evenly within content band
    CONTENT_START = 187
    CONTENT_END   = 1047
    CONTENT_SPAN  = CONTENT_END - CONTENT_START

    total_elements_h = logo_target_h + name_h + pill_h + tag_h
    gap = (CONTENT_SPAN - total_elements_h) // 3

    y = CONTENT_START

    def draw_centered_text(text, font, y_pos):
        bb = draw.textbbox((0,0), text, font=font)
        tw = bb[2] - bb[0]
        draw.text(((W - tw) // 2, y_pos), text, fill=NAVY, font=font)
        return bb[3] - bb[1]

    # 1. PL logo
    logo_x = (W - logo_w) // 2
    img.paste(logo_img, (logo_x, y), logo_img)
    y += logo_target_h + gap

    # 2. Product name
    h = draw_centered_text(product_name, font_name, y)
    y += h + gap

    # 3. Dosage pill
    dw = dose_bb[2] - dose_bb[0]
    pill_x0 = (W - dw) // 2 - pill_pad_x
    pill_y0 = y
    pill_x1 = (W + dw) // 2 + pill_pad_x
    pill_y1 = y + pill_h
    radius  = pill_h // 2
    draw.rounded_rectangle([pill_x0, pill_y0, pill_x1, pill_y1], radius=radius, outline=NAVY, width=6)
    draw.text((W // 2, (pill_y0 + pill_y1) // 2), dosage, fill=NAVY, font=font_dosage, anchor="mm")
    y = pill_y1 + gap

    # 4. Research use only
    draw_centered_text("RESEARCH USE ONLY", font_tag, y)

    out = os.path.join(OUTPUT_DIR, filename)
    img.save(out, "PNG")
    print(f"Saved: {out}")

PRODUCTS = [
    ("label-glp3rt.png",  "GLP-3RT",               "10 MG"),
    ("label-bpc157.png",  "BPC-157",               "10 MG"),
    ("label-tb500.png",   "TB-500",                "10 MG"),
    ("label-cjc1295.png", "CJC-1295 + IPAMORELIN", "5MG / 5MG"),
    ("label-mt2.png",     "MT-2",                  "10 MG"),
    ("label-semax.png",   "SEMAX",                 "10 MG"),
    ("label-selank.png",  "SELANK",                "10 MG"),
]

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for fname, name, dosage in PRODUCTS:
        draw_label(fname, name, dosage)
    print("Done!")
