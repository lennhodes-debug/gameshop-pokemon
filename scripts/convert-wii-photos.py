#!/usr/bin/env python3
"""Convert Wii/Wii U photos to 1000x1000 WebP and map to products."""

import os
import json
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE, "images", "wii")
DST_DIR = os.path.join(BASE, "public", "images", "products")
PRODUCTS_JSON = os.path.join(BASE, "src", "data", "products.json")

# Photo mapping: filename timestamp -> (sku, slug_suffix, is_back)
# Based on manual identification of all 68 photos
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
    ("04 22 06", "WIIU-029", "zelda-wind-waker-hd-selects", False),  # Nintendo Selects edition
    ("04 22 10", "WIIU-029", "zelda-wind-waker-hd-selects", True),
    # Wii
    ("04 22 16", "WII-019", "mario-strikers-charged-football", False),
    ("04 22 21", "WII-019", "mario-strikers-charged-football", True),
    # Wii U
    ("04 22 27", "WIIU-030", "skylanders-imaginators", False),
    ("04 22 38", "WIIU-030", "skylanders-imaginators", True),
    # Wii U
    ("04 22 49", "WIIU-016", "captain-toad-treasure-tracker", False),
    ("04 22 52", "WIIU-016", "captain-toad-treasure-tracker", True),
    # Wii
    ("04 22 58", "WII-033", "new-super-mario-bros-wii-selects", False),  # Nintendo Selects
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

def convert_image(src_path, dst_path, size=1000):
    """Convert image to WebP at size x size."""
    img = Image.open(src_path)
    img = img.convert("RGB")
    # Resize maintaining aspect ratio, then pad to square
    img.thumbnail((size, size), Image.LANCZOS)
    # Create square canvas
    canvas = Image.new("RGB", (size, size), (255, 255, 255))
    x = (size - img.width) // 2
    y = (size - img.height) // 2
    canvas.paste(img, (x, y))
    canvas.save(dst_path, "WEBP", quality=85)
    return True

def main():
    os.makedirs(DST_DIR, exist_ok=True)

    # Build image path mapping: sku -> {image, backImage}
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

        # Build output filename
        sku_lower = sku.lower()
        if is_back:
            dst_filename = f"{sku_lower}-{slug}-back.webp"
        else:
            dst_filename = f"{sku_lower}-{slug}.webp"

        dst_path = os.path.join(DST_DIR, dst_filename)

        try:
            convert_image(src_path, dst_path)
            converted += 1

            # Track paths
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

    # Now update products.json
    with open(PRODUCTS_JSON, "r") as f:
        products = json.load(f)

    # Update existing products with image paths
    updated = 0
    for product in products:
        sku = product["sku"]
        if sku in image_map:
            if "image" in image_map[sku]:
                product["image"] = image_map[sku]["image"]
            if "backImage" in image_map[sku]:
                product["backImage"] = image_map[sku]["backImage"]
            updated += 1

    # Add new products that don't exist yet
    existing_skus = {p["sku"] for p in products}

    NEW_PRODUCTS = [
        # New Wii U games
        {
            "sku": "WIIU-021", "slug": "wiiu-021-wii-party-u",
            "name": "Wii Party U", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Party",
            "price": 15, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Wii Party U biedt meer dan 80 minigames die gebruik maken van de Wii U GamePad. Met TV Party, House Party en GamePad Party modi is er voor elk moment een passende speelstijl. Speel met tot 5 spelers en gebruik de GamePad voor asymmetrische gameplay. Van bordspellen tot actiegames, Wii Party U is de perfecte party game voor de Wii U. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WIIU-022", "slug": "wiiu-022-pokken-tournament",
            "name": "Pokk\u00e9n Tournament", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Vecht",
            "price": 15, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Pokk\u00e9n Tournament is een uniek vechtspel waarin Pok\u00e9mon in real-time 3D-gevechten strijden. Met speelbare Pok\u00e9mon als Pikachu, Lucario, Machamp, Gengar en Suicune. Ontwikkeld door de makers van Tekken biedt het diepgaande vechtmechanismen. De Phase Shift tussen Field Phase en Duel Phase geeft gevechten een unieke flow. Met online multiplayer en lokale splitscreen. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WIIU-023", "slug": "wiiu-023-mario-sonic-sochi-2014",
            "name": "Mario & Sonic op de Olympische Winterspelen: Sotsji 2014", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Sport",
            "price": 10, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Mario & Sonic op de Olympische Winterspelen: Sotsji 2014 brengt Mario en Sonic samen voor wintersporten op de Wii U. Met 24 evenementen waaronder skieen, schaatsen, bobsleeeen en snowboarden. De GamePad biedt unieke besturingsmogelijkheden. Dream Events voegen fantasie-elementen toe aan de Olympische disciplines. Met lokale multiplayer voor tot 4 spelers. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WIIU-024", "slug": "wiiu-024-lego-jurassic-world",
            "name": "LEGO Jurassic World", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Avontuur",
            "price": 12, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "LEGO Jurassic World laat je alle vier de Jurassic Park-films herbeleven in LEGO-stijl. Speel als meer dan 100 personages en 20 dinosaurussen. Met co-op gameplay, puzzels en de kenmerkende LEGO-humor. Van de originele Jurassic Park tot Jurassic World \u2014 alle iconische momenten zijn speelbaar. Nederlandstalig. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WIIU-025", "slug": "wiiu-025-just-dance-2014",
            "name": "Just Dance 2014", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Muziek",
            "price": 8, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Just Dance 2014 bevat 47 nieuwe nummers van artiesten als Lady Gaga, Daft Punk, Nicki Minaj en Robin Thicke. Inclusief Katy Perry's Roar als gratis download. Dans alleen of met vrienden in diverse modi. De Wii U GamePad biedt extra features als Puppet Master en Autodance. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WIIU-026", "slug": "wiiu-026-nintendo-land",
            "name": "Nintendo Land", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Party",
            "price": 8, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Nintendo Land is het ultieme Wii U launch-spel met 12 attracties gebaseerd op Nintendo-franchises. Van Zelda: Battle Quest tot Metroid Blast en Mario Chase. De asymmetrische gameplay waarbij een speler de GamePad gebruikt en anderen Wii Remotes is vernieuwend. Perfekt om de mogelijkheden van de Wii U te demonstreren. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WIIU-027", "slug": "wiiu-027-minecraft-wii-u-edition",
            "name": "Minecraft: Wii U Edition", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Avontuur",
            "price": 15, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Minecraft: Wii U Edition brengt het wereldfenomeen naar de Wii U met exclusieve Super Mario Mash-Up. Bouw, verken en overleef in een oneindige blokkenwonderwereld. Met Creative en Survival modus, lokale splitscreen voor tot 4 spelers en online multiplayer. De GamePad biedt een handige kaartweergave en off-TV play. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WIIU-028", "slug": "wiiu-028-sonic-lost-world",
            "name": "Sonic Lost World: Deadly Six Edition", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Platformer",
            "price": 12, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Sonic Lost World: Deadly Six Edition voor de Wii U biedt snelle 3D-platformactie met de nieuwe Deadly Six-vijanden. Met exclusieve Color Powers, parkour-mechanismen en zowel 3D als 2D levels. De Deadly Six Edition bevat exclusieve content met nieuwe kleurkrachten. Co-op gameplay via GamePad en Wii Remote. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WIIU-029", "slug": "wiiu-029-zelda-wind-waker-hd-selects",
            "name": "The Legend of Zelda: The Wind Waker HD (Nintendo Selects)", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Avontuur",
            "price": 25, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "The Legend of Zelda: The Wind Waker HD in de Nintendo Selects-serie. Dezelfde prachtige HD-remaster van het GameCube-klassiek, nu in de budget-lijn. Zeil over de Great Sea, verken eilanden en dungeons in cel-shaded stijl. Met verbeterde Swift Sail en Tingle Bottle. Een must-have Zelda-avontuur. Europese versie (PAL/EUR). Nintendo Selects editie. Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WIIU-030", "slug": "wiiu-030-skylanders-imaginators",
            "name": "Skylanders Imaginators", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Avontuur",
            "price": 8, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Skylanders Imaginators voor de Wii U laat je je eigen Skylanders creeren. Met uitgebreide character creation en meer dan 30 speelbare Senseis. Het avontuurlijke gameplay combineert actie met verzamelelementen. Portal of Power en figuren apart verkrijgbaar. Nederlandstalige versie. Europese versie (PAL/EUR). Compleet met handleiding. Let op: game only, portal en figuren niet inbegrepen.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WIIU-031", "slug": "wiiu-031-lego-batman-3-beyond-gotham",
            "name": "LEGO Batman 3: Beyond Gotham", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Avontuur",
            "price": 10, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "LEGO Batman 3: Beyond Gotham neemt de Caped Crusader mee de ruimte in. Met meer dan 150 speelbare DC Comics-personages waaronder Batman, Superman, Green Lantern en The Flash. Reis naar de Lantern-werelden en stop Brainiac. Co-op gameplay en de kenmerkende LEGO-humor. Nederlandstalig ondertiteld. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WIIU-032", "slug": "wiiu-032-just-dance-2017",
            "name": "Just Dance 2017", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Muziek",
            "price": 10, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Just Dance 2017 bevat 40 nieuwe nummers en toegang tot 200+ songs via Just Dance Unlimited. Met hits van artiesten als Justin Bieber, Maroon 5, The Weeknd en Queen. Gebruik je smartphone als controller via de Just Dance Controller-app. Nieuwe Way to Play-modus. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WIIU-033", "slug": "wiiu-033-mario-sonic-rio-2016",
            "name": "Mario & Sonic op de Olympische Spelen: Rio 2016", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Sport",
            "price": 12, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Mario & Sonic op de Olympische Spelen: Rio 2016 brengt Mario en Sonic samen in Brazilie. Met 17 sporten waaronder voetbal, rugby, zwemmen en atletiek. Amiibo-ondersteuning voor extra outfits en bonussen. De kleurrijke Braziliaanse sfeer en competitieve multiplayer maken dit de perfecte sportgame. Met lokale en online multiplayer. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WIIU-034", "slug": "wiiu-034-lego-dimensions",
            "name": "LEGO Dimensions", "platform": "Wii U",
            "category": "Games > Wii U", "genre": "Avontuur",
            "price": 8, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "LEGO Dimensions combineert LEGO-bouw met een videogame-avontuur door meerdere LEGO-werelden. Van Batman en Lord of the Rings tot Doctor Who en Ghostbusters. Met de Toy Pad worden fysieke LEGO-figuren in het spel gebracht. Uitbreidbaar met Level Packs, Team Packs en Fun Packs. Europese versie (PAL/EUR). Compleet met handleiding. Let op: game only, Toy Pad en figuren niet inbegrepen.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        # New Wii games
        {
            "sku": "WII-031", "slug": "wii-031-sonic-and-the-secret-rings",
            "name": "Sonic and the Secret Rings", "platform": "Wii",
            "category": "Games > Wii", "genre": "Platformer",
            "price": 8, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Sonic and the Secret Rings is een exclusief Wii-avontuur waarin Sonic door de wereld van Duizend-en-een-Nacht raast. Met motion controls kantel je de Wii Remote om Sonic door de on-rails levels te sturen. Verzamel ringen, ontwijken obstakels en versla de boze djinn Erazor Djinn. Met een Party-modus voor tot 4 spelers en meer dan 40 minigames. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WII-032", "slug": "wii-032-sonic-unleashed",
            "name": "Sonic Unleashed", "platform": "Wii",
            "category": "Games > Wii", "genre": "Platformer",
            "price": 10, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Sonic Unleashed combineert razendsnelle dag-levels met krachtige weerwolf-nachtsecties. Overdag race je als Sonic door spectaculaire 3D-levels over de hele wereld. 's Nachts transformeer je in de Werehog met brawler-gameplay. Verken diverse locaties van Griekenland tot China. De dag-levels behoren tot de snelste Sonic-gameplay ooit. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WII-033", "slug": "wii-033-new-super-mario-bros-wii-selects",
            "name": "New Super Mario Bros. Wii (Nintendo Selects)", "platform": "Wii",
            "category": "Games > Wii", "genre": "Platformer",
            "price": 20, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "New Super Mario Bros. Wii in de Nintendo Selects budget-lijn. Dezelfde klassieke 2D Mario-platformer met tot 4 spelers simultaan cooperatief of competitief. Met Penguin Suit en Propeller Mushroom power-ups. 80 levels verdeeld over 8 werelden. Super Guide helpt minder ervaren spelers. Nintendo Selects editie. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WII-034", "slug": "wii-034-wii-party",
            "name": "Wii Party", "platform": "Wii",
            "category": "Games > Wii", "genre": "Party",
            "price": 10, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Wii Party bevat meer dan 80 minigames en 13 party modes voor tot 4 spelers. Van bordspellen tot huis-party games en duo-uitdagingen. De Mii-personages staan centraal in het feest. Met Bingo, Spin Off, Board Game Island en meer. De minigames maken creatief gebruik van de Wii Remote. Volledig Nederlandstalig. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
        {
            "sku": "WII-035", "slug": "wii-035-wario-land-the-shake-dimension",
            "name": "Wario Land: The Shake Dimension", "platform": "Wii",
            "category": "Games > Wii", "genre": "Platformer",
            "price": 20, "condition": "Gebruikt",
            "completeness": "Compleet in doos (CIB)", "type": "simple",
            "description": "Wario Land: The Shake Dimension is een prachtig handgetekende 2D-platformer voor de Wii. Schud de Wii Remote om munten uit vijanden te schudden en verborgen schatten te onthullen. Wario's hebzucht leidt hem door exotische levels vol verborgen geheimen. De animatiestijl is uniek in het Nintendo-portfolio. Met geheime levels en uitdagingen voor verzamelaars. Europese versie (PAL/EUR). Compleet met handleiding.",
            "weight": 0.1, "isConsole": False, "isPremium": False
        },
    ]

    added = 0
    for product in NEW_PRODUCTS:
        sku = product["sku"]
        if sku not in existing_skus:
            # Add image paths if we have them
            if sku in image_map:
                if "image" in image_map[sku]:
                    product["image"] = image_map[sku]["image"]
                if "backImage" in image_map[sku]:
                    product["backImage"] = image_map[sku]["backImage"]
            else:
                product["image"] = None
            products.append(product)
            added += 1

    # Write updated products.json
    with open(PRODUCTS_JSON, "w") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"Updated {updated} existing products with images")
    print(f"Added {added} new products")
    print(f"Total products: {len(products)}")

if __name__ == "__main__":
    main()
