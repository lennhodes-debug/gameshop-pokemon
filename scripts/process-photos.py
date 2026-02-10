"""
Gameshop Enter — Foto Processor
================================
Verwijdert achtergronden van productfoto's, resize naar 500x500 WebP.

Gebruik:
  python scripts/process-photos.py

Input:  ~/Dropbox/gameshop enter fotos/*.png
Output: public/images/products/photo-{NNN}.webp (tijdelijk, handmatig koppelen aan producten)
"""

import os
import sys
from pathlib import Path
from PIL import Image
from rembg import remove

# Configuratie
DROPBOX_DIR = Path(os.path.expanduser("~/Dropbox/gameshop enter fotos"))
SUBDIR = DROPBOX_DIR / "gautomatiseerde map deeze"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "images" / "products" / "new"
SIZE = (500, 500)
WEBP_QUALITY = 85

def process_image(input_path: Path, output_path: Path) -> bool:
    """Verwijder achtergrond, resize naar 500x500, sla op als WebP."""
    try:
        with open(input_path, "rb") as f:
            input_data = f.read()

        # Achtergrond verwijderen met rembg
        output_data = remove(input_data)

        # Open resultaat, converteer naar RGBA
        from io import BytesIO
        img = Image.open(BytesIO(output_data)).convert("RGBA")

        # Maak witte achtergrond (voor WebP zonder transparantie-issues)
        bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
        composite = Image.alpha_composite(bg, img)
        composite = composite.convert("RGB")

        # Resize met behoud van aspect ratio, centered op 500x500
        composite.thumbnail(SIZE, Image.LANCZOS)

        # Maak 500x500 canvas en centreer de afbeelding
        canvas = Image.new("RGB", SIZE, (255, 255, 255))
        offset_x = (SIZE[0] - composite.width) // 2
        offset_y = (SIZE[1] - composite.height) // 2
        canvas.paste(composite, (offset_x, offset_y))

        # Opslaan als WebP
        canvas.save(output_path, "WEBP", quality=WEBP_QUALITY)
        return True

    except Exception as e:
        print(f"  FOUT: {e}")
        return False


def main():
    # Zoek alle PNG bestanden in beide mappen
    png_files = []

    if DROPBOX_DIR.exists():
        png_files += sorted(DROPBOX_DIR.glob("*.png"))
    else:
        print(f"Map niet gevonden: {DROPBOX_DIR}")
        sys.exit(1)

    if SUBDIR.exists():
        png_files += sorted(SUBDIR.glob("*.png"))

    if not png_files:
        print("Geen PNG bestanden gevonden!")
        sys.exit(1)

    print(f"Gevonden: {len(png_files)} PNG bestanden")
    print(f"Output:   {OUTPUT_DIR}")
    print()

    # Maak output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    success = 0
    failed = 0

    for i, png_file in enumerate(png_files, 1):
        # Output naam: originele bestandsnaam maar als .webp
        stem = png_file.stem.lower().replace(" ", "-")
        output_path = OUTPUT_DIR / f"{stem}.webp"

        # Skip als al verwerkt
        if output_path.exists():
            print(f"  [{i}/{len(png_files)}] SKIP (bestaat al): {output_path.name}")
            success += 1
            continue

        print(f"  [{i}/{len(png_files)}] Verwerken: {png_file.name} ...", end=" ", flush=True)

        if process_image(png_file, output_path):
            print("OK")
            success += 1
        else:
            failed += 1

    print()
    print(f"Klaar! {success} geslaagd, {failed} gefaald")
    print(f"Bestanden in: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
