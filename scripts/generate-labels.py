#!/usr/bin/env python3
"""Generate vial label PNG files for Purpose Labs peptide products."""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../public/3d")
W, H = 3600, 1200
NAVY = (27, 42, 74, 255)
TRANSPARENT = (0, 0, 0, 0)

SERIF_PATHS = [
    "/System/Library/Fonts/Supplemental/Didot.ttc",
    "/System/Library/Fonts/Supplemental/Georgia.ttf",
]
SANS_PATHS  = ["/System/Library/Fonts/Helvetica.ttc"]

def load_font(paths, size, index=0):
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size, index=index)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_pl_monogram(draw, cx, cy, font_size):
    """Draw interlocked PL monogram centered at (cx, cy)."""
    f = load_font(SERIF_PATHS, font_size)
    # P positioned upper-left, L overlapping lower-right
    p_bb = draw.textbbox((0, 0), "P", font=f)
    l_bb = draw.textbbox((0, 0), "L", font=f)
    p_w = p_bb[2] - p_bb[0]
    p_h = p_bb[3] - p_bb[1]
    l_w = l_bb[2] - l_bb[0]
    l_h = l_bb[3] - l_bb[1]

    # Overlap: L starts at ~half P width, drops ~20% of height
    overlap_x = int(p_w * 0.50)
    overlap_y = int(p_h * 0.20)
    total_w = p_w + l_w - overlap_x
    total_h = p_h + overlap_y

    # Center the whole monogram block
    start_x = cx - total_w // 2
    start_y = cy - total_h // 2

    p_x = start_x - p_bb[0]
    p_y = start_y - p_bb[1]
    l_x = start_x + p_w - overlap_x - l_bb[0]
    l_y = start_y + overlap_y - l_bb[1]

    draw.text((p_x, p_y), "P", fill=NAVY, font=f)
    draw.text((l_x, l_y), "L", fill=NAVY, font=f)

def draw_label(filename, product_name, dosage):
    img  = Image.new("RGBA", (W, H), TRANSPARENT)
    draw = ImageDraw.Draw(img)

    font_name   = load_font(SERIF_PATHS, 160) if len(product_name) <= 12 else load_font(SERIF_PATHS, 120)
    font_dosage = load_font(SERIF_PATHS, 90)
    font_tag    = load_font(SANS_PATHS,  72)

    pill_pad_x = 60
    pill_pad_y = 28

    # Monogram size
    MONO_SIZE = 140
    MONO_H    = int(MONO_SIZE * 1.35)  # approx rendered height with overlap

    name_bb  = draw.textbbox((0,0), product_name,        font=font_name)
    dose_bb  = draw.textbbox((0,0), dosage,              font=font_dosage)
    tag_bb   = draw.textbbox((0,0), "RESEARCH USE ONLY", font=font_tag)

    name_h = name_bb[3] - name_bb[1]
    dose_h = dose_bb[3] - dose_bb[1]
    tag_h  = tag_bb[3]  - tag_bb[1]
    pill_h = dose_h + pill_pad_y * 2

    CONTENT_START = 187
    CONTENT_END   = 1047
    CONTENT_SPAN  = CONTENT_END - CONTENT_START

    total_elements_h = MONO_H + name_h + pill_h + tag_h
    total_gap = CONTENT_SPAN - total_elements_h
    gap = total_gap // 3

    y = CONTENT_START

    def draw_centered_text(text, font, y_pos):
        bb = draw.textbbox((0,0), text, font=font)
        tw = bb[2] - bb[0]
        draw.text(((W - tw) // 2, y_pos), text, fill=NAVY, font=font)
        return bb[3] - bb[1]

    # 1. PL monogram
    mono_cx = W // 2
    mono_cy = y + MONO_H // 2
    draw_pl_monogram(draw, mono_cx, mono_cy, MONO_SIZE)
    y += MONO_H + gap

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
