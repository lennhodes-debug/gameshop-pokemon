#!/usr/bin/env python3
"""Fix remaining cartridge photos that v4 missed.

For small cartridges (GBA, GB, DS loose), the bounding-box approach fails
because the hand dominates the silhouette. This script applies targeted
CW rotation since ALL photos have a consistent clockwise tilt from the
same camera setup. Uses edge-alignment scoring to find the best angle.
"""

import os
import glob
import cv2
import numpy as np
from PIL import Image, ImageOps

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS_DIR = os.path.join(BASE, "public", "images", "products")
BACKUP_DIR = os.path.join(BASE, "public", "images", "products_backup")

# Images already processed by v4 — skip these
V4_PROCESSED = set()


def edge_alignment_score(pil_img):
    """Score how well edges align with axes. Focus on the CENTER of the image
    where the cartridge/case is, ignoring the hand at the bottom."""
    img_np = np.array(pil_img)
    h, w = img_np.shape[:2] if len(img_np.shape) == 2 else img_np.shape[:2]

    if len(img_np.shape) == 3:
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    else:
        gray = img_np

    # Focus on center 70% of image (exclude hand at bottom, edges)
    y1 = int(h * 0.05)
    y2 = int(h * 0.75)
    x1 = int(w * 0.1)
    x2 = int(w * 0.9)
    roi = gray[y1:y2, x1:x2]

    edges = cv2.Canny(roi, 50, 150)
    rh, rw = edges.shape

    # Vertical alignment: count pixels that have a neighbor directly above/below
    vert_score = 0
    for col in range(0, rw, 3):
        col_data = edges[:, col]
        positions = np.where(col_data > 0)[0]
        if len(positions) > 1:
            vert_score += np.sum(np.diff(positions) == 1)

    # Horizontal alignment: count pixels with neighbor directly left/right
    horiz_score = 0
    for row in range(0, rh, 3):
        row_data = edges[row, :]
        positions = np.where(row_data > 0)[0]
        if len(positions) > 1:
            horiz_score += np.sum(np.diff(positions) == 1)

    return vert_score + horiz_score


def find_best_cw_angle(img_path, max_angle=8):
    """Try CW rotations from 0 to max_angle and return the one with best alignment."""
    img = Image.open(img_path)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    best_angle = 0
    best_score = edge_alignment_score(img)

    # Coarse: 0 to max_angle in 1° steps (CW = negative in PIL)
    for deg in range(1, max_angle + 1):
        # CW rotation in PIL is negative angle
        rotated = img.rotate(deg, resample=Image.BICUBIC, expand=True,
                             fillcolor=(255, 255, 255))
        score = edge_alignment_score(rotated)
        if score > best_score:
            best_score = score
            best_angle = deg

    # Also try small CCW for rare cases
    for deg in [1, 2, 3]:
        rotated = img.rotate(-deg, resample=Image.BICUBIC, expand=True,
                             fillcolor=(255, 255, 255))
        score = edge_alignment_score(rotated)
        if score > best_score:
            best_score = score
            best_angle = -deg

    if best_angle == 0:
        return 0

    # Fine search around best angle
    fine_best = best_angle
    for offset in [-0.5, 0.5]:
        test_angle = best_angle + offset
        rotated = img.rotate(test_angle, resample=Image.BICUBIC, expand=True,
                             fillcolor=(255, 255, 255))
        score = edge_alignment_score(rotated)
        if score > best_score:
            best_score = score
            fine_best = test_angle

    return fine_best


def straighten_image(img_path, angle):
    """Apply rotation and save."""
    img = Image.open(img_path)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")
    orig_w, orig_h = img.size

    if abs(angle) < 0.3:
        return False

    rotated = img.rotate(angle, resample=Image.BICUBIC, expand=True,
                         fillcolor=(255, 255, 255))

    # Trim white borders
    rot_np = np.array(rotated)
    gray = cv2.cvtColor(rot_np, cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(gray, 245, 255, cv2.THRESH_BINARY_INV)
    coords = cv2.findNonZero(thresh)

    if coords is not None:
        x, y, cw, ch = cv2.boundingRect(coords)
        pad = 4
        x = max(0, x - pad)
        y = max(0, y - pad)
        cw = min(rotated.width - x, cw + 2 * pad)
        ch = min(rotated.height - y, ch + 2 * pad)
        rotated = rotated.crop((x, y, x + cw, y + ch))

    rotated = rotated.resize((orig_w, orig_h), Image.LANCZOS)
    rotated.save(img_path, "WEBP", quality=85)
    return True


def main():
    # Get list of images v4 already processed (from v4 output)
    # We'll process ALL images and skip ones that are already well-aligned
    all_images = sorted(glob.glob(os.path.join(PRODUCTS_DIR, "*.webp")))

    # Only process images that are likely cartridges (GBA, GB, DS loose, 3DS loose)
    # CIB and Wii/Wii U cases were handled by v4
    targets = []
    for img_path in all_images:
        fn = os.path.basename(img_path)
        # GBA cartridges
        if fn.startswith("gba-"):
            targets.append(img_path)
        # GB cartridges
        elif fn.startswith("gb-"):
            targets.append(img_path)
        # DS loose cartridges (no "cib" in name)
        elif fn.startswith("ds-") and "cib" not in fn:
            targets.append(img_path)
        # 3DS loose cartridges (no "cib" in name)
        elif fn.startswith("3ds-") and "cib" not in fn:
            targets.append(img_path)

    print(f"Doel: {len(targets)} cartridge-afbeeldingen\n")

    # First restore these from backup
    restored = 0
    for img_path in targets:
        fn = os.path.basename(img_path)
        backup = os.path.join(BACKUP_DIR, fn)
        if os.path.exists(backup):
            import shutil
            shutil.copy2(backup, img_path)
            restored += 1
    print(f"Hersteld uit backup: {restored}\n")

    straightened = 0
    skipped = 0
    errors = 0

    for i, img_path in enumerate(targets):
        fn = os.path.basename(img_path)
        try:
            angle = find_best_cw_angle(img_path)

            if abs(angle) < 0.3:
                skipped += 1
                continue

            if straighten_image(img_path, angle):
                straightened += 1
                direction = "CCW" if angle > 0 else "CW"
                print(f"  [{i+1}/{len(targets)}] RECHT  {fn}  ({abs(angle):.1f} {direction})")
            else:
                skipped += 1

        except Exception as e:
            errors += 1
            print(f"  [{i+1}/{len(targets)}] ERROR  {fn}: {e}")

    print(f"\nResultaat:")
    print(f"  Rechtgezet:    {straightened}")
    print(f"  Overgeslagen:  {skipped}")
    print(f"  Fouten:        {errors}")
    print(f"  Totaal:        {len(targets)}")


if __name__ == "__main__":
    main()
