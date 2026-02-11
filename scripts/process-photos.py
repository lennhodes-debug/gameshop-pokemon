"""
Gameshop Enter - Foto Processor v4
===================================
Conservatieve achtergrondverwijdering die het VOLLEDIGE product behoudt.

Kenmerken:
- rembg met alpha_matting en hoge foreground_threshold (0.6)
- Bounding box detectie met 5% padding na achtergrondverwijdering
- Fallback naar center-crop als rembg te veel verwijdert (< 20% product area)
- Sobel filter voor betere voor/achter classificatie
- Groepering op fotonummer-gaps en kleurovereenkomst
- Output: 500x500 WebP, quality 85, witte achtergrond

Gebruik:
  python scripts/process-photos.py [--input PAD] [--output PAD] [--dry-run] [--skip-rembg]
"""

import os
import sys
import csv
import argparse
import time
from pathlib import Path
from io import BytesIO
from typing import Optional

from PIL import Image, ImageFilter
import numpy as np

# ---------------------------------------------------------------------------
# Configuratie
# ---------------------------------------------------------------------------
DEFAULT_INPUT = Path("C:/Users/Jorn/Dropbox/gameshop enter fotos")
DEFAULT_OUTPUT = Path(__file__).parent.parent / "public" / "images" / "products" / "new"
SIZE = (500, 500)
WEBP_QUALITY = 85

# Groepering
COLOR_THRESHOLD = 80          # Euclidische afstand voor nieuwe game detectie
NUM_GAP_THRESHOLD = 5         # Fotonummer gap voor nieuwe game

# Classificatie
SIDE_WIDTH_THRESHOLD = 0.35   # Product breedte fractie om zijkant te detecteren
EDGE_SIMILARITY_THRESHOLD = 5 # Min verschil in edge score voor voor/achter

# Achtergrondverwijdering
MIN_PRODUCT_AREA_RATIO = 0.20 # Minimaal 20% van het origineel moet product zijn
BBOX_PADDING_RATIO = 0.05     # 5% padding rond het product
REMBG_FOREGROUND_THRESHOLD = 240  # Alpha waarde voor foreground (conservatief)
REMBG_BACKGROUND_THRESHOLD = 15   # Alpha waarde voor background
REMBG_ERODE_SIZE = 5          # Erosie kernel grootte

# Ondersteunde extensies
IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg")


# ---------------------------------------------------------------------------
# Hulpfuncties - Analyse
# ---------------------------------------------------------------------------
def get_dominant_color(img_path: Path) -> tuple[int, int, int]:
    """Bereken de dominante kleur van het centrale deel van de foto."""
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    crop = img.crop((w // 4, h // 4, 3 * w // 4, 3 * h // 4))
    arr = np.array(crop.resize((50, 50)))
    mean_color = arr.mean(axis=(0, 1)).astype(int)
    return (int(mean_color[0]), int(mean_color[1]), int(mean_color[2]))


def color_distance(c1: tuple[int, int, int], c2: tuple[int, int, int]) -> float:
    """Euclidische afstand tussen twee RGB kleuren."""
    return float(
        ((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2) ** 0.5
    )


def sobel_edge_score(img_path: Path) -> float:
    """Meet de hoeveelheid detail/randen met Sobel filter.

    Sobel is nauwkeuriger dan FIND_EDGES voor het onderscheiden van
    voorkant (artwork/label met veel detail) vs achterkant (PCB/blanco).
    """
    img = Image.open(img_path).convert("L").resize((150, 150))
    arr = np.array(img, dtype=np.float64)

    # Sobel kernels
    sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float64)
    sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float64)

    # Handmatige 2D convolutie (geen scipy nodig)
    h, w = arr.shape
    gx = np.zeros_like(arr)
    gy = np.zeros_like(arr)

    for i in range(1, h - 1):
        for j in range(1, w - 1):
            patch = arr[i - 1 : i + 2, j - 1 : j + 2]
            gx[i, j] = np.sum(patch * sobel_x)
            gy[i, j] = np.sum(patch * sobel_y)

    magnitude = np.sqrt(gx**2 + gy**2)
    return float(magnitude.mean())


def product_width(img_path: Path) -> float:
    """Meet hoe breed het product is als fractie van de foto."""
    img = Image.open(img_path).convert("RGB")
    arr = np.array(img.resize((200, 200)))
    gray = arr.mean(axis=2)
    bright_cols = (gray > 60).mean(axis=0)
    return float((bright_cols > 0.3).sum() / len(bright_cols))


def content_area(img_path: Path) -> float:
    """Meet hoeveel van de foto bezet wordt door het product."""
    img = Image.open(img_path).convert("RGB")
    arr = np.array(img.resize((200, 200)))
    brightness = arr.mean(axis=2)
    return float((brightness > 50).mean())


def parse_photo_number(path: Path) -> int:
    """Haal het foto nummer uit de bestandsnaam (bijv. IMG_1234.png -> 1234)."""
    stem = path.stem
    for part in stem.split("_"):
        if part.isdigit():
            return int(part)
    # Fallback: probeer alles na laatste underscore
    try:
        return int(stem.rsplit("_", 1)[-1])
    except ValueError:
        return 0


# ---------------------------------------------------------------------------
# Hulpfuncties - Voortgang
# ---------------------------------------------------------------------------
def format_duration(seconds: float) -> str:
    """Formatteer seconden naar mm:ss of uu:mm:ss."""
    if seconds < 60:
        return f"{seconds:.0f}s"
    minutes = int(seconds // 60)
    secs = int(seconds % 60)
    if minutes < 60:
        return f"{minutes}m{secs:02d}s"
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours}u{mins:02d}m{secs:02d}s"


def print_progress(current: int, total: int, start_time: float, label: str = "") -> None:
    """Toon voortgangsbalk met tijdsindicatie."""
    elapsed = time.time() - start_time
    pct = current / total if total > 0 else 1.0
    bar_width = 30
    filled = int(bar_width * pct)
    bar = "#" * filled + "-" * (bar_width - filled)

    # Geschatte resterende tijd
    if current > 0 and pct < 1.0:
        eta = elapsed / pct - elapsed
        eta_str = f"ETA {format_duration(eta)}"
    elif pct >= 1.0:
        eta_str = f"klaar in {format_duration(elapsed)}"
    else:
        eta_str = "berekenen..."

    prefix = f"  {label} " if label else "  "
    line = f"\r{prefix}[{bar}] {current}/{total} ({pct:.0%}) | {eta_str}"
    sys.stdout.write(line.ljust(90))
    sys.stdout.flush()

    if current == total:
        sys.stdout.write("\n")
        sys.stdout.flush()


# ---------------------------------------------------------------------------
# Beeldverwerking
# ---------------------------------------------------------------------------
def find_product_bbox(
    img: Image.Image, padding_ratio: float = BBOX_PADDING_RATIO
) -> tuple[int, int, int, int]:
    """Vind de bounding box van niet-transparante pixels met padding.

    Retourneert (left, top, right, bottom) in pixels.
    """
    if img.mode != "RGBA":
        return (0, 0, img.width, img.height)

    alpha = np.array(img.split()[3])
    # Non-transparante pixels (alpha > 10)
    rows = np.any(alpha > 10, axis=1)
    cols = np.any(alpha > 10, axis=0)

    if not rows.any() or not cols.any():
        return (0, 0, img.width, img.height)

    top = int(np.argmax(rows))
    bottom = int(img.height - np.argmax(rows[::-1]))
    left = int(np.argmax(cols))
    right = int(img.width - np.argmax(cols[::-1]))

    # Voeg padding toe
    pad_x = int((right - left) * padding_ratio)
    pad_y = int((bottom - top) * padding_ratio)

    left = max(0, left - pad_x)
    top = max(0, top - pad_y)
    right = min(img.width, right + pad_x)
    bottom = min(img.height, bottom + pad_y)

    return (left, top, right, bottom)


def calculate_product_area_ratio(original: Image.Image, result: Image.Image) -> float:
    """Bereken hoeveel van het origineel als product behouden is.

    Vergelijkt het aantal niet-transparante pixels in het resultaat
    met het totaal aantal pixels in het origineel.
    """
    if result.mode != "RGBA":
        return 1.0

    alpha = np.array(result.split()[3])
    product_pixels = int(np.sum(alpha > 10))
    total_pixels = original.width * original.height

    if total_pixels == 0:
        return 0.0

    return product_pixels / total_pixels


def process_with_rembg(input_path: Path, output_path: Path) -> bool:
    """Conservatieve achtergrondverwijdering met rembg.

    Gebruikt alpha_matting met hoge foreground_threshold zodat meer van
    het product behouden blijft. Als rembg te veel verwijdert (product
    area < 20%), vallen we terug op simpele center-crop.
    """
    try:
        from rembg import remove

        with open(input_path, "rb") as f:
            input_data = f.read()

        original = Image.open(BytesIO(input_data)).convert("RGB")

        # Conservatieve achtergrondverwijdering met alpha matting
        # Hoge foreground_threshold = meer pixels als voorgrond behandeld
        output_data = remove(
            input_data,
            alpha_matting=True,
            alpha_matting_foreground_threshold=REMBG_FOREGROUND_THRESHOLD,
            alpha_matting_background_threshold=REMBG_BACKGROUND_THRESHOLD,
            alpha_matting_erode_size=REMBG_ERODE_SIZE,
        )

        result = Image.open(BytesIO(output_data)).convert("RGBA")

        # Check of rembg niet te veel heeft verwijderd
        area_ratio = calculate_product_area_ratio(original, result)

        if area_ratio < MIN_PRODUCT_AREA_RATIO:
            # Fallback: rembg heeft te veel verwijderd, gebruik center-crop
            return process_simple(input_path, output_path)

        # Vind bounding box van het product met padding
        bbox = find_product_bbox(result, BBOX_PADDING_RATIO)
        cropped = result.crop(bbox)

        # Composiet op witte achtergrond
        bg = Image.new("RGBA", cropped.size, (255, 255, 255, 255))
        composite = Image.alpha_composite(bg, cropped).convert("RGB")

        # Resize met behoud van aspect ratio, centreer op 500x500 canvas
        composite.thumbnail(SIZE, Image.LANCZOS)
        canvas = Image.new("RGB", SIZE, (255, 255, 255))
        offset_x = (SIZE[0] - composite.width) // 2
        offset_y = (SIZE[1] - composite.height) // 2
        canvas.paste(composite, (offset_x, offset_y))

        canvas.save(str(output_path), "WEBP", quality=WEBP_QUALITY)
        return True

    except ImportError:
        print("\n  FOUT: 'rembg' niet geinstalleerd. Installeer met: pip install rembg[gpu]")
        return False
    except Exception as e:
        # Bij elke fout in rembg: fallback naar simpele verwerking
        try:
            return process_simple(input_path, output_path)
        except Exception:
            print(f"\n  FOUT: {e}")
            return False


def process_simple(input_path: Path, output_path: Path) -> bool:
    """Simpele verwerking: center-crop naar 500x500 WebP met witte achtergrond.

    Gebruikt als fallback wanneer rembg te veel van het product verwijdert.
    """
    try:
        img = Image.open(input_path).convert("RGB")
        img.thumbnail(SIZE, Image.LANCZOS)
        canvas = Image.new("RGB", SIZE, (255, 255, 255))
        offset_x = (SIZE[0] - img.width) // 2
        offset_y = (SIZE[1] - img.height) // 2
        canvas.paste(img, (offset_x, offset_y))
        canvas.save(str(output_path), "WEBP", quality=WEBP_QUALITY)
        return True
    except Exception as e:
        print(f"\n  FOUT bij simpele verwerking: {e}")
        return False


# ---------------------------------------------------------------------------
# Groepering en classificatie
# ---------------------------------------------------------------------------
def collect_images(input_dir: Path) -> list[Path]:
    """Verzamel alle afbeeldingen uit de invoermap, gesorteerd op fotonummer."""
    all_images: list[Path] = []
    for f in input_dir.iterdir():
        if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS:
            all_images.append(f)

    all_images.sort(key=parse_photo_number)
    return all_images


def analyze_photos(
    images: list[Path], start_time: float
) -> list[dict[str, object]]:
    """Analyseer alle foto's: kleur, edge score, breedte, oppervlakte."""
    photos: list[dict[str, object]] = []

    for i, p in enumerate(images):
        num = parse_photo_number(p)
        pw = product_width(p)
        es = sobel_edge_score(p)
        area = content_area(p)
        dom = get_dominant_color(p)

        photos.append({
            "path": p,
            "num": num,
            "is_side": pw < SIDE_WIDTH_THRESHOLD,
            "edge": es,
            "area": area,
            "dominant": dom,
        })

        print_progress(i + 1, len(images), start_time, "Analyseren")

    return photos


def group_photos(
    photos: list[dict[str, object]],
) -> list[list[dict[str, object]]]:
    """Groepeer foto's per game op basis van fotonummer-gap en kleurverschil."""
    if not photos:
        return []

    groups: list[list[dict[str, object]]] = []
    current_group: list[dict[str, object]] = [photos[0]]

    for i in range(1, len(photos)):
        prev = photos[i - 1]
        curr = photos[i]
        prev_num: int = prev["num"]  # type: ignore[assignment]
        curr_num: int = curr["num"]  # type: ignore[assignment]
        num_gap = curr_num - prev_num

        new_game = False

        # Grote gap in fotonummers = nieuw product
        if num_gap > NUM_GAP_THRESHOLD:
            new_game = True
        # Kleurverschil tussen niet-zijkant foto's
        elif not curr["is_side"] and not prev["is_side"]:
            curr_dom: tuple[int, int, int] = curr["dominant"]  # type: ignore[assignment]
            prev_dom: tuple[int, int, int] = prev["dominant"]  # type: ignore[assignment]
            dist = color_distance(curr_dom, prev_dom)
            if dist > COLOR_THRESHOLD:
                new_game = True

        if new_game:
            groups.append(current_group)
            current_group = [curr]
        else:
            current_group.append(curr)

    groups.append(current_group)
    return groups


def classify_front_back(
    group: list[dict[str, object]],
) -> tuple[Optional[dict[str, object]], Optional[dict[str, object]]]:
    """Classificeer foto's als voorkant of achterkant.

    Voorkant: hoge Sobel edge score (meer artwork/tekst detail)
    Achterkant: lage Sobel edge score (PCB, blanco)
    """
    # Filter zijkant-foto's eruit
    non_side = [p for p in group if not p["is_side"]]
    if not non_side:
        non_side = group  # fallback

    # Sorteer op edge score: hoog = voorkant
    sorted_by_edge = sorted(non_side, key=lambda x: x["edge"], reverse=True)  # type: ignore[arg-type]

    best_front: Optional[dict[str, object]] = None
    best_back: Optional[dict[str, object]] = None

    if len(sorted_by_edge) >= 2:
        median_idx = len(sorted_by_edge) // 2
        median_edge: float = sorted_by_edge[median_idx]["edge"]  # type: ignore[assignment]

        fronts = [p for p in sorted_by_edge if p["edge"] >= median_edge]  # type: ignore[operator]
        backs = [p for p in sorted_by_edge if p["edge"] < median_edge]  # type: ignore[operator]

        # Als alle foto's vergelijkbare edge scores hebben, behandel als voorkant
        top_edge: float = sorted_by_edge[0]["edge"]  # type: ignore[assignment]
        bottom_edge: float = sorted_by_edge[-1]["edge"]  # type: ignore[assignment]
        edge_range = top_edge - bottom_edge

        if edge_range < EDGE_SIMILARITY_THRESHOLD:
            fronts = sorted_by_edge
            backs = []
    else:
        fronts = sorted_by_edge
        backs = []

    if fronts:
        best_front = max(fronts, key=lambda x: x["area"])  # type: ignore[arg-type]
    if backs:
        best_back = max(backs, key=lambda x: x["area"])  # type: ignore[arg-type]

    return best_front, best_back


# ---------------------------------------------------------------------------
# Hoofdprogramma
# ---------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(
        description="Gameshop Enter Foto Processor v4 - Conservatieve achtergrondverwijdering"
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=DEFAULT_INPUT,
        help=f"Map met bronfotos (standaard: {DEFAULT_INPUT})",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Uitvoermap voor WebP bestanden (standaard: {DEFAULT_OUTPUT})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Analyseer alleen, verwerk geen foto's",
    )
    parser.add_argument(
        "--skip-rembg",
        action="store_true",
        help="Sla achtergrondverwijdering over, gebruik simpele center-crop",
    )
    args = parser.parse_args()

    input_dir: Path = args.input
    output_dir: Path = args.output
    start_time = time.time()

    # Banner
    print("=" * 60)
    print("  Gameshop Enter - Foto Processor v4")
    print("  Conservatieve achtergrondverwijdering")
    print("=" * 60)
    print(f"  Invoer:  {input_dir}")
    print(f"  Uitvoer: {output_dir}")
    print(f"  Modus:   {'dry-run' if args.dry_run else 'skip-rembg' if args.skip_rembg else 'rembg (conservatief)'}")
    print("=" * 60)
    print()

    # Validatie
    if not input_dir.exists():
        print(f"FOUT: Invoermap niet gevonden: {input_dir}")
        sys.exit(1)

    # Verzamel afbeeldingen
    all_images = collect_images(input_dir)
    if not all_images:
        print(f"FOUT: Geen afbeeldingen gevonden in {input_dir}")
        print(f"  Ondersteunde formaten: {', '.join(IMAGE_EXTENSIONS)}")
        sys.exit(1)

    print(f"Gevonden: {len(all_images)} foto's")
    print()

    # --- STAP 1: Analyseer ---
    print("--- Stap 1/4: Foto's analyseren ---")
    analysis_start = time.time()
    photos = analyze_photos(all_images, analysis_start)
    print(f"  {len(photos)} foto's geanalyseerd in {format_duration(time.time() - analysis_start)}")
    print()

    # --- STAP 2: Groepeer ---
    print("--- Stap 2/4: Groeperen per game ---")
    groups = group_photos(photos)
    print(f"  {len(groups)} games gedetecteerd")
    print()

    # --- STAP 3: Classificeer ---
    print("--- Stap 3/4: Voor/achterkant classificeren ---")

    results: list[dict[str, object]] = []

    for gi, group in enumerate(groups):
        best_front, best_back = classify_front_back(group)

        first_num: int = group[0]["num"]  # type: ignore[assignment]
        last_num: int = group[-1]["num"]  # type: ignore[assignment]
        num_range = f"{first_num}-{last_num}"
        total = len(group)
        sides = sum(1 for p in group if p["is_side"])

        result: dict[str, object] = {
            "group": gi + 1,
            "range": num_range,
            "total": total,
            "fronts_count": sum(1 for p in group if not p["is_side"]),
            "sides": sides,
            "best_front": best_front,
            "best_back": best_back,
        }
        results.append(result)

        # Log per game
        if best_front is not None:
            front_num: int = best_front["num"]  # type: ignore[assignment]
            front_edge: float = best_front["edge"]  # type: ignore[assignment]
            front_str = f"IMG_{front_num} (sobel={front_edge:.1f})"
        else:
            front_str = "GEEN"

        if best_back is not None:
            back_num: int = best_back["num"]  # type: ignore[assignment]
            back_edge: float = best_back["edge"]  # type: ignore[assignment]
            back_str = f"IMG_{back_num} (sobel={back_edge:.1f})"
        else:
            back_str = "GEEN"

        print(
            f"  Game {gi + 1:3d}: IMG_{num_range} "
            f"({total} foto's, {sides} zijkant) "
            f"-> Voor: {front_str}, Achter: {back_str}"
        )

    print()

    # Dry-run stopt hier
    if args.dry_run:
        elapsed = time.time() - start_time
        print(f"=== DRY RUN VOLTOOID ===")
        print(f"  {len(results)} games gedetecteerd")
        print(f"  Geen foto's verwerkt")
        print(f"  Tijd: {format_duration(elapsed)}")
        return

    # --- STAP 4: Verwerk ---
    output_dir.mkdir(parents=True, exist_ok=True)

    process_fn = process_simple if args.skip_rembg else process_with_rembg
    modus_naam = "simpele center-crop" if args.skip_rembg else "conservatieve rembg"
    print(f"--- Stap 4/4: Verwerken ({modus_naam}) ---")

    # Tel totaal te verwerken foto's
    total_to_process = sum(
        (1 if r["best_front"] is not None else 0) + (1 if r["best_back"] is not None else 0)
        for r in results
    )

    processed = 0
    succeeded = 0
    skipped = 0
    failed = 0
    fallback_count = 0
    process_start = time.time()

    for r in results:
        game_num: int = r["group"]  # type: ignore[assignment]
        best_f: Optional[dict[str, object]] = r["best_front"]  # type: ignore[assignment]
        best_b: Optional[dict[str, object]] = r["best_back"]  # type: ignore[assignment]

        for side, label, photo in [("front", "voorkant", best_f), ("back", "achterkant", best_b)]:
            if photo is None:
                continue

            processed += 1
            src: Path = photo["path"]  # type: ignore[assignment]
            dst = output_dir / f"game-{game_num:03d}-{side}.webp"

            if dst.exists():
                skipped += 1
                print_progress(processed, total_to_process, process_start, "Verwerken")
                continue

            ok = process_fn(src, dst)
            if ok:
                succeeded += 1
            else:
                failed += 1

            print_progress(processed, total_to_process, process_start, "Verwerken")

    print()

    # --- CSV mapping ---
    csv_path = output_dir / "foto-mapping.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "game_nr",
            "foto_range",
            "totaal_fotos",
            "voorkant_bestand",
            "achterkant_bestand",
            "voorkant_bron",
            "achterkant_bron",
        ])
        for r in results:
            grp: int = r["group"]  # type: ignore[assignment]
            rng: str = r["range"]  # type: ignore[assignment]
            tot: int = r["total"]  # type: ignore[assignment]
            bf: Optional[dict[str, object]] = r["best_front"]  # type: ignore[assignment]
            bb: Optional[dict[str, object]] = r["best_back"]  # type: ignore[assignment]

            front_file = f"game-{grp:03d}-front.webp" if bf is not None else ""
            back_file = f"game-{grp:03d}-back.webp" if bb is not None else ""
            front_src_path: Path = bf["path"] if bf is not None else Path("")  # type: ignore[assignment]
            back_src_path: Path = bb["path"] if bb is not None else Path("")  # type: ignore[assignment]
            front_src = front_src_path.name if bf is not None else ""
            back_src = back_src_path.name if bb is not None else ""

            writer.writerow([grp, rng, tot, front_file, back_file, front_src, back_src])

    # --- Samenvatting ---
    elapsed = time.time() - start_time
    print("=" * 60)
    print("  SAMENVATTING")
    print("=" * 60)
    print(f"  Bronfotos gevonden:     {len(all_images)}")
    print(f"  Games gedetecteerd:     {len(results)}")
    print(f"  Foto's verwerkt:        {succeeded}")
    print(f"  Overgeslagen (bestaan): {skipped}")
    print(f"  Mislukt:                {failed}")
    print(f"  CSV mapping:            {csv_path}")
    print(f"  Output map:             {output_dir}")
    print(f"  Totale tijd:            {format_duration(elapsed)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
