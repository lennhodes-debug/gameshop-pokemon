"""
Gameshop Enter - Smart Foto Processor v2
=========================================
1. Groepeert foto's per game op basis van kleurovereenkomst
2. Classificeert voor/achter via edge detection (labels hebben meer detail)
3. Selecteert de beste voorkant + achterkant
4. Verwijdert achtergrond en slaat op als 500x500 WebP

Gebruik: python scripts/process-photos.py
"""

import os
import sys
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageFilter
import numpy as np

# Configuratie
DROPBOX_DIR = Path("C:/Users/Jorn/Dropbox/gameshop enter fotos")
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "images" / "products" / "new"
SIZE = (500, 500)
WEBP_QUALITY = 85


def get_dominant_color(img_path: Path) -> tuple:
    """Bereken de dominante kleur van het centrale deel van de foto."""
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    crop = img.crop((w//4, h//4, 3*w//4, 3*h//4))
    arr = np.array(crop.resize((50, 50)))
    return tuple(arr.mean(axis=(0,1)).astype(int))


def color_distance(c1: tuple, c2: tuple) -> float:
    """Euclidische afstand tussen twee RGB kleuren."""
    return ((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2 + (c1[2]-c2[2])**2) ** 0.5


def edge_score(img_path: Path) -> float:
    """Meet de hoeveelheid detail/randen in de foto.
    Voorkant (label met tekst/artwork) = hoog, achterkant (PCB) = laag."""
    img = Image.open(img_path).convert("L").resize((100, 100))
    edges = np.array(img.filter(ImageFilter.FIND_EDGES))
    return edges.mean()


def product_width(img_path: Path) -> float:
    """Meet hoe breed het product is als fractie van de foto."""
    img = Image.open(img_path).convert("RGB")
    arr = np.array(img.resize((200, 200)))
    gray = arr.mean(axis=2)
    bright_cols = (gray > 60).mean(axis=0)
    return (bright_cols > 0.3).sum() / len(bright_cols)


def content_area(img_path: Path) -> float:
    """Meet hoeveel van de foto bezet wordt door het product."""
    img = Image.open(img_path).convert("RGB")
    arr = np.array(img.resize((200, 200)))
    brightness = arr.mean(axis=2)
    return (brightness > 50).mean()


def process_with_rembg(input_path: Path, output_path: Path) -> bool:
    """Verwijder achtergrond, resize naar 500x500, sla op als WebP."""
    try:
        from rembg import remove
        with open(input_path, "rb") as f:
            input_data = f.read()
        output_data = remove(input_data)
        img = Image.open(BytesIO(output_data)).convert("RGBA")
        bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
        composite = Image.alpha_composite(bg, img).convert("RGB")
        composite.thumbnail(SIZE, Image.LANCZOS)
        canvas = Image.new("RGB", SIZE, (255, 255, 255))
        offset_x = (SIZE[0] - composite.width) // 2
        offset_y = (SIZE[1] - composite.height) // 2
        canvas.paste(composite, (offset_x, offset_y))
        canvas.save(str(output_path), "WEBP", quality=WEBP_QUALITY)
        return True
    except Exception as e:
        print(f"  FOUT: {e}")
        return False


def main():
    # Verzamel alle PNG's
    pngs = sorted(DROPBOX_DIR.glob("*.png"), key=lambda p: int(p.stem.split("_")[1]))
    print(f"Gevonden: {len(pngs)} foto's")
    print()

    # STAP 1: Analyseer alle foto's
    print("=== STAP 1: Foto's analyseren ===")
    photos = []
    for i, p in enumerate(pngs):
        num = int(p.stem.split("_")[1])
        pw = product_width(p)
        es = edge_score(p)
        area = content_area(p)
        dom = get_dominant_color(p)
        photos.append({
            "path": p,
            "num": num,
            "is_side": pw < 0.35,
            "edge": es,
            "area": area,
            "dominant": dom,
        })
        if (i + 1) % 20 == 0:
            print(f"  Geanalyseerd: {i+1}/{len(pngs)}")
    print(f"  Klaar: {len(pngs)} foto's geanalyseerd")

    # STAP 2: Groepeer per game
    print()
    print("=== STAP 2: Groeperen per game ===")
    THRESHOLD = 80
    groups = []
    current_group = [photos[0]]

    for i in range(1, len(photos)):
        prev = photos[i-1]
        curr = photos[i]
        num_gap = curr["num"] - prev["num"]

        new_game = False
        if num_gap > 5:
            new_game = True
        elif not curr["is_side"] and not prev["is_side"]:
            dist = color_distance(curr["dominant"], prev["dominant"])
            if dist > THRESHOLD:
                new_game = True

        if new_game:
            groups.append(current_group)
            current_group = [curr]
        else:
            current_group.append(curr)

    groups.append(current_group)
    print(f"  {len(groups)} games gedetecteerd")

    # STAP 3: Classificeer voor/achter met edge score (relatief per groep)
    print()
    print("=== STAP 3: Beste foto selecteren per game ===")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    results = []
    for gi, group in enumerate(groups):
        # Filter zijkant-foto's eruit
        non_side = [p for p in group if not p["is_side"]]
        if not non_side:
            non_side = group  # fallback

        # Sorteer op edge score: hoog = voorkant (meer detail/tekst)
        sorted_by_edge = sorted(non_side, key=lambda x: x["edge"], reverse=True)

        if len(sorted_by_edge) >= 2:
            # Gebruik mediaan edge score als grens
            median_edge = sorted_by_edge[len(sorted_by_edge)//2]["edge"]
            fronts = [p for p in sorted_by_edge if p["edge"] >= median_edge]
            backs = [p for p in sorted_by_edge if p["edge"] < median_edge]

            # Controleer: als het verschil tussen hoogste en laagste edge < 5 is,
            # dan zijn het waarschijnlijk allemaal dezelfde kant
            edge_range = sorted_by_edge[0]["edge"] - sorted_by_edge[-1]["edge"]
            if edge_range < 5:
                # Weinig verschil -> waarschijnlijk allemaal voorkant
                fronts = sorted_by_edge
                backs = []
        else:
            fronts = sorted_by_edge
            backs = []

        # Selecteer de beste (hoogste content area)
        best_front = max(fronts, key=lambda x: x["area"]) if fronts else None
        best_back = max(backs, key=lambda x: x["area"]) if backs else None

        num_range = f"{group[0]['num']}-{group[-1]['num']}"
        total = len(group)
        sides = sum(1 for p in group if p["is_side"])

        result = {
            "group": gi + 1,
            "range": num_range,
            "total": total,
            "fronts": len(fronts),
            "backs": len(backs),
            "sides": sides,
            "best_front": best_front,
            "best_back": best_back,
        }
        results.append(result)

        front_str = f"IMG_{best_front['num']}" if best_front else "GEEN"
        back_str = f"IMG_{best_back['num']}" if best_back else "GEEN"
        f_edge = f" (edge={best_front['edge']:.1f})" if best_front else ""
        b_edge = f" (edge={best_back['edge']:.1f})" if best_back else ""
        print(f"  Game {gi+1:2d}: IMG_{num_range} ({total} foto's, {sides} zijkant) -> Voor: {front_str}{f_edge}, Achter: {back_str}{b_edge}")

    # STAP 4: Verwerk de beste foto's met rembg
    print()
    print("=== STAP 4: Achtergrond verwijderen ===")
    total_process = sum(1 for r in results if r["best_front"]) + sum(1 for r in results if r["best_back"])
    processed = 0

    for r in results:
        game_num = r["group"]

        if r["best_front"]:
            processed += 1
            src = r["best_front"]["path"]
            dst = OUTPUT_DIR / f"game-{game_num:03d}-front.webp"
            if dst.exists():
                print(f"  [{processed}/{total_process}] SKIP: {dst.name}")
            else:
                print(f"  [{processed}/{total_process}] Voorkant game {game_num}: {src.name} ...", end=" ", flush=True)
                if process_with_rembg(src, dst):
                    print("OK")
                else:
                    print("FOUT")

        if r["best_back"]:
            processed += 1
            src = r["best_back"]["path"]
            dst = OUTPUT_DIR / f"game-{game_num:03d}-back.webp"
            if dst.exists():
                print(f"  [{processed}/{total_process}] SKIP: {dst.name}")
            else:
                print(f"  [{processed}/{total_process}] Achterkant game {game_num}: {src.name} ...", end=" ", flush=True)
                if process_with_rembg(src, dst):
                    print("OK")
                else:
                    print("FOUT")

    print()
    print(f"Klaar! {len(results)} games, {processed} foto's verwerkt")
    print(f"Output: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
