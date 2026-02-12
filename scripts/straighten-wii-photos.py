#!/usr/bin/env python3
"""Straighten Wii/Wii U photos: stronger rotation + tighter crop from source JPGs."""

import os
import cv2
import numpy as np
from PIL import Image, ImageOps

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE, "images", "wii")
DST_DIR = os.path.join(BASE, "public", "images", "products")

# Improved rotation corrections (degrees counter-clockwise) — increased from original
ROTATION_CORRECTIONS = {
    "WII-004": 8,    # Super Mario Galaxy 2 — flinke tilt
    "WII-007": 5,    # New Super Mario Bros Wii
    "WII-008": 6,    # Donkey Kong Country Returns
    "WII-009": 6,    # Wii Sports
    "WII-011": 5,    # Mario Party 8
    "WII-019": 5,    # Mario Strikers Charged Football
    "WII-031": 6,    # Sonic and the Secret Rings
    "WII-032": 6,    # Sonic Unleashed
    "WII-033": 5,    # New Super Mario Bros Wii Selects
    "WII-034": 6,    # Wii Party
    "WII-035": 7,    # Wario Land Shake Dimension
    "WIIU-001": 7,   # Mario Kart 8 — flinke tilt
    "WIIU-004": 6,   # Splatoon
    "WIIU-006": 6,   # Zelda Wind Waker HD
    "WIIU-007": 7,   # Zelda Twilight Princess HD — flinke tilt
    "WIIU-008": 5,   # New Super Mario Bros U + Luigi U
    "WIIU-013": 6,   # Mario Party 10
    "WIIU-016": 6,   # Captain Toad Treasure Tracker
    "WIIU-018": 6,   # Paper Mario Color Splash
    "WIIU-021": 6,   # Wii Party U
    "WIIU-022": 5,   # Pokken Tournament
    "WIIU-023": 6,   # Mario & Sonic Sochi 2014
    "WIIU-024": 6,   # LEGO Jurassic World
    "WIIU-025": 6,   # Just Dance 2014
    "WIIU-026": 6,   # Nintendo Land
    "WIIU-027": 7,   # Minecraft Wii U Edition — flinke tilt
    "WIIU-028": 6,   # Sonic Lost World
    "WIIU-029": 6,   # Zelda Wind Waker HD Selects
    "WIIU-030": 6,   # Skylanders Imaginators
    "WIIU-031": 6,   # LEGO Batman 3
    "WIIU-032": 6,   # Just Dance 2017
    "WIIU-033": 6,   # Mario & Sonic Rio 2016
    "WIIU-034": 6,   # LEGO Dimensions
}

# Photo mapping from original convert script
PHOTO_MAP = [
    ("04 16 24", "WIIU-006", "zelda-wind-waker-hd", False),
    ("04 16 29", "WIIU-006", "zelda-wind-waker-hd", True),
    ("04 16 41", "WIIU-013", "mario-party-10", False),
    ("04 16 45", "WIIU-013", "mario-party-10", True),
    ("04 16 54", "WIIU-021", "wii-party-u", False),
    ("04 16 58", "WIIU-021", "wii-party-u", True),
    ("04 17 06", "WIIU-022", "pokken-tournament", False),
    ("04 17 11", "WIIU-022", "pokken-tournament", True),
    ("04 17 31", "WIIU-023", "mario-sonic-sochi-2014", False),
    ("04 17 34", "WIIU-023", "mario-sonic-sochi-2014", True),
    ("04 17 43", "WIIU-024", "lego-jurassic-world", False),
    ("04 17 50", "WIIU-024", "lego-jurassic-world", True),
    ("04 17 59", "WIIU-025", "just-dance-2014", False),
    ("04 18 07", "WIIU-025", "just-dance-2014", True),
    ("04 18 20", "WIIU-026", "nintendo-land", False),
    ("04 18 27", "WIIU-026", "nintendo-land", True),
    ("04 18 37", "WIIU-027", "minecraft-wii-u-edition", False),
    ("04 18 43", "WIIU-027", "minecraft-wii-u-edition", True),
    ("04 18 55", "WIIU-021B", "wii-party-u-2", False),
    ("04 19 00", "WIIU-021B", "wii-party-u-2", True),
    ("04 19 09", "WIIU-001", "mario-kart-8", False),
    ("04 19 14", "WIIU-001", "mario-kart-8", True),
    ("04 20 46", "WIIU-028", "sonic-lost-world", False),
    ("04 20 49", "WIIU-028", "sonic-lost-world", True),
    ("04 20 56", "WII-007", "new-super-mario-bros-wii", False),
    ("04 21 01", "WII-007", "new-super-mario-bros-wii", True),
    ("04 21 08", "WII-004", "super-mario-galaxy-2", False),
    ("04 21 12", "WII-004", "super-mario-galaxy-2", True),
    ("04 21 19", "WII-011", "mario-party-8", False),
    ("04 21 22", "WII-011", "mario-party-8", True),
    ("04 21 31", "WII-031", "sonic-and-the-secret-rings", False),
    ("04 21 35", "WII-031", "sonic-and-the-secret-rings", True),
    ("04 21 41", "WII-009", "wii-sports", False),
    ("04 21 49", "WII-009", "wii-sports", True),
    ("04 21 56", "WII-032", "sonic-unleashed", False),
    ("04 22 00", "WII-032", "sonic-unleashed", True),
    ("04 22 06", "WIIU-029", "zelda-wind-waker-hd-selects", False),
    ("04 22 10", "WIIU-029", "zelda-wind-waker-hd-selects", True),
    ("04 22 16", "WII-019", "mario-strikers-charged-football", False),
    ("04 22 21", "WII-019", "mario-strikers-charged-football", True),
    ("04 22 27", "WIIU-030", "skylanders-imaginators", False),
    ("04 22 38", "WIIU-030", "skylanders-imaginators", True),
    ("04 22 49", "WIIU-016", "captain-toad-treasure-tracker", False),
    ("04 22 52", "WIIU-016", "captain-toad-treasure-tracker", True),
    ("04 22 58", "WII-033", "new-super-mario-bros-wii-selects", False),
    ("04 23 02", "WII-033", "new-super-mario-bros-wii-selects", True),
    ("04 23 07", "WII-008", "donkey-kong-country-returns", False),
    ("04 23 11", "WII-008", "donkey-kong-country-returns", True),
    ("04 23 16", "WIIU-031", "lego-batman-3-beyond-gotham", False),
    ("04 23 20", "WIIU-031", "lego-batman-3-beyond-gotham", True),
    ("04 23 25", "WIIU-007", "zelda-twilight-princess-hd", False),
    ("04 23 29", "WIIU-007", "zelda-twilight-princess-hd", True),
    ("04 23 35", "WIIU-032", "just-dance-2017", False),
    ("04 23 38", "WIIU-032", "just-dance-2017", True),
    ("04 23 44", "WIIU-008", "new-super-mario-bros-u-luigi-u", False),
    ("04 23 48", "WIIU-008", "new-super-mario-bros-u-luigi-u", True),
    ("04 23 57", "WIIU-033", "mario-sonic-rio-2016", False),
    ("04 24 03", "WIIU-033", "mario-sonic-rio-2016", True),
    ("04 24 10", "WIIU-018", "paper-mario-color-splash", False),
    ("04 24 15", "WIIU-018", "paper-mario-color-splash", True),
    ("04 24 21", "WII-034", "wii-party", False),
    ("04 24 25", "WII-034", "wii-party", True),
    ("04 24 34", "WII-035", "wario-land-the-shake-dimension", False),
    ("04 24 38", "WII-035", "wario-land-the-shake-dimension", True),
    ("04 24 51", "WIIU-004", "splatoon", False),
    ("04 24 58", "WIIU-004", "splatoon", True),
    ("04 25 04", "WIIU-034", "lego-dimensions", False),
    ("04 25 07", "WIIU-034", "lego-dimensions", True),
]


def auto_detect_rotation(img_path):
    """Use OpenCV edge detection to find the actual tilt angle of the game case."""
    img = cv2.imread(img_path)
    if img is None:
        return None

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150, apertureSize=3)

    # Detect lines using Hough transform
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100,
                            minLineLength=100, maxLineGap=10)
    if lines is None:
        return None

    # Focus on near-vertical lines (the case edges)
    angles = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        length = np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        if length < 80:
            continue
        angle = np.degrees(np.arctan2(x2 - x1, y2 - y1))
        # Near-vertical lines: angle close to 0
        if abs(angle) < 15:
            angles.append(angle)

    if not angles:
        return None

    # Return median angle
    return np.median(angles)


def straighten_image(src_path, dst_path, manual_rotation, size=500):
    """Straighten, crop, and resize a game case photo."""
    img = Image.open(src_path)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    # Use manual rotation — auto-detect was too conservative
    rotation = manual_rotation

    # Use auto-detection only as a secondary boost if it detects MORE tilt
    auto_angle = auto_detect_rotation(src_path)
    if auto_angle is not None and abs(auto_angle) > abs(rotation):
        rotation = (rotation + auto_angle) / 2  # Average of both

    # Apply rotation
    if abs(rotation) > 0.5:
        img = img.rotate(rotation, resample=Image.BICUBIC, expand=True,
                         fillcolor=(255, 255, 255))

    # Mild crop: just trim rotation artifacts, keep full game case in frame
    w, h = img.size
    left = int(w * 0.04)
    top = int(h * 0.02)
    right = int(w * 0.96)
    bottom = int(h * 0.93)
    img = img.crop((left, top, right, bottom))

    # Auto-crop white borders
    img_np = np.array(img)
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    coords = cv2.findNonZero(thresh)
    if coords is not None:
        x, y, cw, ch = cv2.boundingRect(coords)
        # Add small padding
        pad = 10
        x = max(0, x - pad)
        y = max(0, y - pad)
        cw = min(img.width - x, cw + 2 * pad)
        ch = min(img.height - y, ch + 2 * pad)
        img = img.crop((x, y, x + cw, y + ch))

    # Resize to fit in size x size maintaining aspect ratio
    img.thumbnail((size, size), Image.LANCZOS)

    # Create square canvas with white background
    canvas = Image.new("RGB", (size, size), (255, 255, 255))
    x_offset = (size - img.width) // 2
    y_offset = (size - img.height) // 2
    canvas.paste(img, (x_offset, y_offset))
    canvas.save(dst_path, "WEBP", quality=85)
    return True


def main():
    converted = 0
    skipped = 0
    errors = 0

    for timestamp, sku, slug, is_back in PHOTO_MAP:
        if sku.endswith("B"):
            skipped += 1
            continue

        src_filename = f"Foto 12-02-2026, {timestamp}.jpg"
        src_path = os.path.join(SRC_DIR, src_filename)

        if not os.path.exists(src_path):
            print(f"  MISSING: {src_filename}")
            errors += 1
            continue

        rotation = ROTATION_CORRECTIONS.get(sku, 5)
        sku_lower = sku.lower()

        if is_back:
            dst_filename = f"{sku_lower}-{slug}-back.webp"
        else:
            dst_filename = f"{sku_lower}-{slug}.webp"

        dst_path = os.path.join(DST_DIR, dst_filename)

        try:
            straighten_image(src_path, dst_path, rotation)
            converted += 1
            status = "FRONT" if not is_back else "BACK "
            print(f"  {status} {sku} -> {dst_filename}")
        except Exception as e:
            print(f"  ERROR {sku}: {e}")
            errors += 1

    print(f"\nResultaat: {converted} geconverteerd, {skipped} overgeslagen, {errors} fouten")


if __name__ == "__main__":
    main()
