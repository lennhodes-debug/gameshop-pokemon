"""Converteer HEIC naar WebP 500x500 voor identificatie."""
import os
from pillow_heif import register_heif_opener
from PIL import Image

register_heif_opener()

IN_DIR = "/tmp/drive-heic"
OUT_DIR = "/tmp/drive-webp"
os.makedirs(OUT_DIR, exist_ok=True)

files = sorted(f for f in os.listdir(IN_DIR) if f.endswith(".HEIC"))
for f in files:
    src = os.path.join(IN_DIR, f)
    dst = os.path.join(OUT_DIR, f.replace(".HEIC", ".webp"))
    try:
        img = Image.open(src).convert("RGB")
        img.thumbnail((800, 800), Image.LANCZOS)
        img.save(dst, "WEBP", quality=85)
        print(f"OK {f} -> {img.size}")
    except Exception as e:
        print(f"FAIL {f}: {e}")

print(f"\nKlaar: {len(os.listdir(OUT_DIR))} bestanden")
