"""Verwerk alle Google Drive HEIC foto's naar product WebP bestanden."""
import os
from pillow_heif import register_heif_opener
from PIL import Image

register_heif_opener()

IN_DIR = "/tmp/drive-heic"
OUT_DIR = "c:/Users/Jorn/gameshop-1/public/images/products"

# Mapping: (front_heic, back_heic) -> (front_webp, back_webp)
CONVERSIONS = {
    # === CIB versies voor bestaande games (cib suffix) ===
    # DS-001 Platinum EUR
    ("IMG_2247.HEIC", "IMG_2248.HEIC"): ("ds-001-pokemon-platinum-cib.webp", "ds-001-pokemon-platinum-cib-back.webp"),
    # DS-002 SoulSilver EUR
    ("IMG_2258.HEIC", "IMG_2259.HEIC"): ("ds-002-pokemon-soulsilver-cib.webp", "ds-002-pokemon-soulsilver-cib-back.webp"),
    # DS-003 HeartGold EUR
    ("IMG_2253.HEIC", "IMG_2254.HEIC"): ("ds-003-pokemon-heartgold-cib.webp", "ds-003-pokemon-heartgold-cib-back.webp"),
    # DS-004 Pearl EUR
    ("IMG_2239.HEIC", "IMG_2241.HEIC"): ("ds-004-pokemon-pearl-cib.webp", "ds-004-pokemon-pearl-cib-back.webp"),
    # DS-006 White EUR
    ("IMG_2270.HEIC", "IMG_2271.HEIC"): ("ds-006-pokemon-white-cib.webp", "ds-006-pokemon-white-cib-back.webp"),
    # DS-008 Ranger Shadows of Almia EUR
    ("IMG_2234.HEIC", "IMG_2235.HEIC"): ("ds-008-pokemon-ranger-shadows-of-almia-cib.webp", "ds-008-pokemon-ranger-shadows-of-almia-cib-back.webp"),
    # DS-009 MD Explorers of Time EUR
    ("IMG_2243.HEIC", "IMG_2244.HEIC"): ("ds-009-pokemon-mystery-dungeon-explorers-of-time-cib.webp", "ds-009-pokemon-mystery-dungeon-explorers-of-time-cib-back.webp"),

    # === Nieuwe games ===
    # DS-010 Diamond EUR
    ("IMG_2230.HEIC", "IMG_2231.HEIC"): ("ds-010-pokemon-diamond-eur.webp", "ds-010-pokemon-diamond-eur-back.webp"),
    # DS-011 MD Blue Rescue Team EUR
    ("IMG_2232.HEIC", "IMG_2233.HEIC"): ("ds-011-pokemon-md-blue-rescue-team.webp", "ds-011-pokemon-md-blue-rescue-team-back.webp"),
    # DS-012 MD Explorers of Sky EUR
    ("IMG_2237.HEIC", "IMG_2238.HEIC"): ("ds-012-pokemon-md-explorers-of-sky.webp", "ds-012-pokemon-md-explorers-of-sky-back.webp"),
    # DS-013 Ranger EUR (original)
    ("IMG_2260.HEIC", "IMG_2261.HEIC"): ("ds-013-pokemon-ranger.webp", "ds-013-pokemon-ranger-back.webp"),
    # DS-014 MD Explorers of Darkness EUR
    ("IMG_2264.HEIC", "IMG_2265.HEIC"): ("ds-014-pokemon-md-explorers-of-darkness.webp", "ds-014-pokemon-md-explorers-of-darkness-back.webp"),
    # DS-015 Conquest USA
    ("IMG_2245.HEIC", "IMG_2246.HEIC"): ("ds-015-pokemon-conquest.webp", "ds-015-pokemon-conquest-back.webp"),
    # DS-016 Black 2 EUR
    ("IMG_2266.HEIC", "IMG_2267.HEIC"): ("ds-016-pokemon-black-2.webp", "ds-016-pokemon-black-2-back.webp"),
    # DS-017 White 2 EUR
    ("IMG_2268.HEIC", "IMG_2269.HEIC"): ("ds-017-pokemon-white-2.webp", "ds-017-pokemon-white-2-back.webp"),
    # DS-018 Diamond USA
    ("IMG_2262.HEIC", "IMG_2263.HEIC"): ("ds-018-pokemon-diamond-usa.webp", "ds-018-pokemon-diamond-usa-back.webp"),
    # DS-019 Platinum USA
    ("IMG_2249.HEIC", "IMG_2250.HEIC"): ("ds-019-pokemon-platinum-usa.webp", "ds-019-pokemon-platinum-usa-back.webp"),
    # DS-020 Pearl USA
    ("IMG_2251.HEIC", "IMG_2252.HEIC"): ("ds-020-pokemon-pearl-usa.webp", "ds-020-pokemon-pearl-usa-back.webp"),
    # DS-021 HeartGold USA
    ("IMG_2255.HEIC", "IMG_2256.HEIC"): ("ds-021-pokemon-heartgold-usa.webp", "ds-021-pokemon-heartgold-usa-back.webp"),
}

def convert(src_name, dst_name):
    src = os.path.join(IN_DIR, src_name)
    dst = os.path.join(OUT_DIR, dst_name)
    img = Image.open(src).convert("RGB")
    img.thumbnail((500, 500), Image.LANCZOS)
    img.save(dst, "WEBP", quality=85)
    return f"{dst_name} ({img.size[0]}x{img.size[1]})"

count = 0
for (front_heic, back_heic), (front_webp, back_webp) in sorted(CONVERSIONS.items()):
    r1 = convert(front_heic, front_webp)
    r2 = convert(back_heic, back_webp)
    print(f"OK {r1}")
    print(f"OK {r2}")
    count += 1

print(f"\nKlaar: {count} games, {count*2} bestanden")
