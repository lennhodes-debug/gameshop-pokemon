#!/usr/bin/env python3
"""Process console hardware photos to WebP with white backgrounds."""

import os
import glob
from PIL import Image, ImageOps

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = BASE
DST_DIR = os.path.join(BASE, "public", "images", "consoles")

# Console photo mappings - map filename patterns to console names
CONSOLE_MAPPING = {
    "00 40": ("nintendo-ds", "Nintendo DS"),
    "00 41": ("nintendo-3ds", "Nintendo 3DS"),
    "00 43": ("wii-u", "Wii U"),
    "00 47": ("wii", "Nintendo Wii"),
    "00 50": ("game-boy-advance", "Game Boy Advance"),
    "00 51": ("game-boy-color", "Game Boy Color"),
}

def process_console_image(src_path, dst_path, size=1200):
    """Convert image to WebP at size x size with white background."""
    try:
        img = Image.open(src_path)

        # Apply EXIF orientation
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")

        # Resize maintaining aspect ratio
        img.thumbnail((size, size), Image.LANCZOS)

        # Create square canvas with white background
        canvas = Image.new("RGB", (size, size), (255, 255, 255))
        x = (size - img.width) // 2
        y = (size - img.height) // 2
        canvas.paste(img, (x, y))

        canvas.save(dst_path, "WEBP", quality=85)
        return True
    except Exception as e:
        print(f"ERROR processing {src_path}: {e}")
        return False

def main():
    os.makedirs(DST_DIR, exist_ok=True)

    # Find all console photos
    photo_files = glob.glob(os.path.join(SRC_DIR, "Foto 12-02-2026, *.jpg"))
    photo_files.sort()

    print(f"Found {len(photo_files)} console photos")

    processed = {}

    for src_path in photo_files:
        filename = os.path.basename(src_path)
        print(f"Processing: {filename}")

        # Extract time from filename (e.g., "00 40" from "Foto 12-02-2026, 00 40 14.jpg")
        time_part = filename.split(", ")[1].split()[0:2]  # Get "00 40" part
        time_key = f"{time_part[0]} {time_part[1]}"

        # Find matching console
        console_name = None
        console_slug = None
        for key, (slug, name) in CONSOLE_MAPPING.items():
            if time_key.startswith(key):
                console_name = name
                console_slug = slug
                break

        if not console_name:
            print(f"  SKIPPED: Unknown console time {time_key}")
            continue

        # Count photos per console
        if console_slug not in processed:
            processed[console_slug] = {"name": console_name, "count": 0, "files": []}

        photo_num = processed[console_slug]["count"]
        processed[console_slug]["count"] += 1

        # For first photo (main), save as console-name.webp
        # For additional photos, save as console-name-2.webp, console-name-3.webp
        if photo_num == 0:
            dst_filename = f"{console_slug}.webp"
        else:
            dst_filename = f"{console_slug}-{photo_num + 1}.webp"

        dst_path = os.path.join(DST_DIR, dst_filename)

        if process_console_image(src_path, dst_path):
            processed[console_slug]["files"].append(dst_filename)
            print(f"  → {dst_filename}")
        else:
            processed[console_slug]["count"] -= 1

    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    for console_slug in sorted(processed.keys()):
        data = processed[console_slug]
        print(f"{data['name']:25} - {data['count']} photos")
        for f in data["files"]:
            print(f"  • {f}")

if __name__ == "__main__":
    main()
