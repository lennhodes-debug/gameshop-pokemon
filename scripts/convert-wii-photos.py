#!/usr/bin/env python3
"""Convert Wii/Wii U photos to 1000x1000 WebP with rotation correction."""

import os
import json
from PIL import Image, ImageOps, ExifTags

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE, "images", "wii")
DST_DIR = os.path.join(BASE, "public", "images", "products")
PRODUCTS_JSON = os.path.join(BASE, "src", "data", "products.json")

# Per-SKU rotation correction (counter-clockwise degrees to straighten)
# Based on visual analysis of each photo's clockwise tilt
ROTATION_CORRECTIONS = {
    "WII-004": 4,    # Super Mario Galaxy 2
    "WII-007": 2,    # New Super Mario Bros Wii
    "WII-008": 3,    # Donkey Kong Country Returns
    "WII-009": 3,    # Wii Sports
    "WII-011": 2,    # Mario Party 8
    "WII-019": 2,    # Mario Strikers Charged Football
    "WII-031": 3,    # Sonic and the Secret Rings
    "WII-032": 3,    # Sonic Unleashed
    "WII-033": 2,    # New Super Mario Bros Wii Selects
    "WII-034": 3,    # Wii Party
    "WII-035": 4,    # Wario Land Shake Dimension
    "WIIU-001": 4,   # Mario Kart 8
    "WIIU-004": 3,   # Splatoon
    "WIIU-006": 3,   # Zelda Wind Waker HD
    "WIIU-007": 3,   # Zelda Twilight Princess HD
    "WIIU-008": 2,   # New Super Mario Bros U + Luigi U
    "WIIU-013": 3,   # Mario Party 10
    "WIIU-016": 3,   # Captain Toad Treasure Tracker
    "WIIU-018": 3,   # Paper Mario Color Splash
    "WIIU-021": 3,   # Wii Party U
    "WIIU-022": 2,   # Pokken Tournament
    "WIIU-023": 3,   # Mario & Sonic Sochi 2014
    "WIIU-024": 3,   # LEGO Jurassic World
    "WIIU-025": 3,   # Just Dance 2014
    "WIIU-026": 3,   # Nintendo Land
    "WIIU-027": 3,   # Minecraft Wii U Edition
    "WIIU-028": 3,   # Sonic Lost World
    "WIIU-029": 3,   # Zelda Wind Waker HD Selects
    "WIIU-030": 3,   # Skylanders Imaginators
    "WIIU-031": 3,   # LEGO Batman 3
    "WIIU-032": 3,   # Just Dance 2017
    "WIIU-033": 3,   # Mario & Sonic Rio 2016
    "WIIU-034": 3,   # LEGO Dimensions
}

# Photo mapping: filename timestamp -> (sku, slug_suffix, is_back)
PHOTO_MAP = [
    # Wii U games
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
    ("04 18 55", "WIIU-021B", "wii-party-u-2", False),  # 2nd copy, skip
    ("04 19 00", "WIIU-021B", "wii-party-u-2", True),   # 2nd copy, skip
    ("04 19 09", "WIIU-001", "mario-kart-8", False),
    ("04 19 14", "WIIU-001", "mario-kart-8", True),
    ("04 20 46", "WIIU-028", "sonic-lost-world", False),
    ("04 20 49", "WIIU-028", "sonic-lost-world", True),
    # Wii games
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
    # Back to Wii U
    ("04 22 06", "WIIU-029", "zelda-wind-waker-hd-selects", False),
    ("04 22 10", "WIIU-029", "zelda-wind-waker-hd-selects", True),
    # Wii
    ("04 22 16", "WII-019", "mario-strikers-charged-football", False),
    ("04 22 21", "WII-019", "mario-strikers-charged-football", True),
    # Wii U
    ("04 22 27", "WIIU-030", "skylanders-imaginators", False),
    ("04 22 38", "WIIU-030", "skylanders-imaginators", True),
    ("04 22 49", "WIIU-016", "captain-toad-treasure-tracker", False),
    ("04 22 52", "WIIU-016", "captain-toad-treasure-tracker", True),
    # Wii
    ("04 22 58", "WII-033", "new-super-mario-bros-wii-selects", False),
    ("04 23 02", "WII-033", "new-super-mario-bros-wii-selects", True),
    ("04 23 07", "WII-008", "donkey-kong-country-returns", False),
    ("04 23 11", "WII-008", "donkey-kong-country-returns", True),
    # Wii U
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
    # Wii
    ("04 24 21", "WII-034", "wii-party", False),
    ("04 24 25", "WII-034", "wii-party", True),
    ("04 24 34", "WII-035", "wario-land-the-shake-dimension", False),
    ("04 24 38", "WII-035", "wario-land-the-shake-dimension", True),
    # Wii U
    ("04 24 51", "WIIU-004", "splatoon", False),
    ("04 24 58", "WIIU-004", "splatoon", True),
    ("04 25 04", "WIIU-034", "lego-dimensions", False),
    ("04 25 07", "WIIU-034", "lego-dimensions", True),
]


def convert_image(src_path, dst_path, rotation_deg=0, size=1000):
    """Convert image to WebP at size x size with rotation correction."""
    img = Image.open(src_path)

    # Apply EXIF orientation first
    img = ImageOps.exif_transpose(img)

    img = img.convert("RGB")

    # Apply rotation correction (counter-clockwise to fix clockwise tilt)
    if rotation_deg != 0:
        img = img.rotate(rotation_deg, resample=Image.BICUBIC, expand=True,
                         fillcolor=(255, 255, 255))

    # Crop 5% from edges to reduce background/hand visibility after rotation
    w, h = img.size
    crop_pct = 0.05
    left = int(w * crop_pct)
    top = int(h * crop_pct)
    right = int(w * (1 - crop_pct))
    bottom = int(h * (1 - crop_pct))
    img = img.crop((left, top, right, bottom))

    # Resize maintaining aspect ratio, then pad to square
    img.thumbnail((size, size), Image.LANCZOS)

    # Create square canvas with white background
    canvas = Image.new("RGB", (size, size), (255, 255, 255))
    x = (size - img.width) // 2
    y = (size - img.height) // 2
    canvas.paste(img, (x, y))
    canvas.save(dst_path, "WEBP", quality=85)
    return True


def main():
    os.makedirs(DST_DIR, exist_ok=True)

    image_map = {}
    converted = 0
    skipped = 0

    for timestamp, sku, slug, is_back in PHOTO_MAP:
        # Skip duplicate copies
        if sku.endswith("B"):
            skipped += 1
            continue

        src_filename = f"Foto 12-02-2026, {timestamp}.jpg"
        src_path = os.path.join(SRC_DIR, src_filename)

        if not os.path.exists(src_path):
            print(f"MISSING: {src_path}")
            continue

        # Get rotation correction for this SKU
        rotation = ROTATION_CORRECTIONS.get(sku, 3)

        # Build output filename
        sku_lower = sku.lower()
        if is_back:
            dst_filename = f"{sku_lower}-{slug}-back.webp"
        else:
            dst_filename = f"{sku_lower}-{slug}.webp"

        dst_path = os.path.join(DST_DIR, dst_filename)

        try:
            convert_image(src_path, dst_path, rotation_deg=rotation)
            converted += 1

            if sku not in image_map:
                image_map[sku] = {}

            web_path = f"/images/products/{dst_filename}"
            if is_back:
                image_map[sku]["backImage"] = web_path
            else:
                image_map[sku]["image"] = web_path

        except Exception as e:
            print(f"ERROR converting {src_filename}: {e}")

    print(f"Converted {converted} images, skipped {skipped} duplicates")

    # Update products.json with image paths
    with open(PRODUCTS_JSON, "r") as f:
        products = json.load(f)

    updated = 0
    for product in products:
        sku = product["sku"]
        if sku in image_map:
            if "image" in image_map[sku]:
                product["image"] = image_map[sku]["image"]
            if "backImage" in image_map[sku]:
                product["backImage"] = image_map[sku]["backImage"]
            updated += 1

    with open(PRODUCTS_JSON, "w") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"Updated {updated} products with images")
    print(f"Total products: {len(products)}")


if __name__ == "__main__":
    main()
