#!/usr/bin/env python3
"""Generate vial label PNG files for Purpose Labs peptide products."""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../public/3d")
W, H = 3600, 1200
NAVY = (27, 42, 74, 255)
TRANSPARENT = (0, 0, 0, 0)

SERIF_PATHS = ["/System/Library/Fonts/Supplemental/Georgia.ttf"]
SANS_PATHS  = ["/System/Library/Fonts/Helvetica.ttc"]

def load_font(paths, size):
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def draw_label(filename, product_name, dosage):
    img  = Image.new("RGBA", (W, H), TRANSPARENT)
    draw = ImageDraw.Draw(img)

    font_logo   = load_font(SERIF_PATHS, 140)
    font_name   = load_font(SERIF_PATHS, 160) if len(product_name) <= 12 else load_font(SERIF_PATHS, 120)
    font_dosage = load_font(SERIF_PATHS, 90)
    font_tag    = load_font(SANS_PATHS,  72)

    pill_pad_x = 60
    pill_pad_y = 28

    # Measure each element
    logo_bb  = draw.textbbox((0,0), "PL",               font=font_logo)
    name_bb  = draw.textbbox((0,0), product_name,        font=font_name)
    dose_bb  = draw.textbbox((0,0), dosage,              font=font_dosage)
    tag_bb   = draw.textbbox((0,0), "RESEARCH USE ONLY", font=font_tag)

    logo_h = logo_bb[3] - logo_bb[1]
    name_h = name_bb[3] - name_bb[1]
    dose_h = dose_bb[3] - dose_bb[1]
    tag_h  = tag_bb[3]  - tag_bb[1]
    pill_h = dose_h + pill_pad_y * 2

    # Match original GLP-3RT proportions:
    # content starts at y=187, ends at y=1047  =>  span=860, start=187
    CONTENT_START = 187
    CONTENT_END   = 1047
    CONTENT_SPAN  = CONTENT_END - CONTENT_START  # 860

    # Four elements with three gaps between them
    total_elements_h = logo_h + name_h + pill_h + tag_h
    total_gap = CONTENT_SPAN - total_elements_h
    gap = total_gap // 3  # equal gaps between 4 elements

    y = CONTENT_START

    def draw_centered_text(text, font, y_pos):
        bb = draw.textbbox((0,0), text, font=font)
        tw = bb[2] - bb[0]
        draw.text(((W - tw) // 2, y_pos), text, fill=NAVY, font=font)
        return bb[3] - bb[1]

    # 1. PL logo
    h = draw_centered_text("PL", font_logo, y)
    y += h + gap

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
