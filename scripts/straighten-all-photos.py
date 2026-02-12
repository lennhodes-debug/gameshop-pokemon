#!/usr/bin/env python3
"""Straighten ALL product photos — auto-detect tilt angle via edge detection."""

import os
import glob
import cv2
import numpy as np
from PIL import Image, ImageOps

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS_DIR = os.path.join(BASE, "public", "images", "products")
# Backup originals first time
BACKUP_DIR = os.path.join(BASE, "public", "images", "products_backup")


def detect_tilt_angle(img_path):
    """Detect the tilt angle of a game case/cartridge photo using edge detection."""
    img = cv2.imread(img_path)
    if img is None:
        return 0

    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 30, 120, apertureSize=3)

    # Detect lines
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=80,
                            minLineLength=max(w, h) * 0.15,
                            maxLineGap=15)
    if lines is None:
        return 0

    vertical_angles = []
    horizontal_angles = []

    for line in lines:
        x1, y1, x2, y2 = line[0]
        length = np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        if length < max(w, h) * 0.1:
            continue

        # Angle from vertical (0 = perfectly vertical)
        angle_from_vert = np.degrees(np.arctan2(x2 - x1, y2 - y1))
        # Angle from horizontal (0 = perfectly horizontal)
        angle_from_horiz = np.degrees(np.arctan2(y2 - y1, x2 - x1))

        # Collect near-vertical lines (case sides)
        if abs(angle_from_vert) < 20:
            vertical_angles.append(angle_from_vert)

        # Collect near-horizontal lines (case top/bottom)
        if abs(angle_from_horiz) < 20:
            horizontal_angles.append(angle_from_horiz)

    # Prefer vertical edges (more reliable for game cases)
    if len(vertical_angles) >= 3:
        angle = np.median(vertical_angles)
    elif len(horizontal_angles) >= 3:
        angle = np.median(horizontal_angles)
    elif vertical_angles:
        angle = np.median(vertical_angles)
    elif horizontal_angles:
        angle = np.median(horizontal_angles)
    else:
        return 0

    # Clamp to reasonable range
    if abs(angle) > 15:
        return 0
    return angle


def straighten_image(img_path, angle):
    """Rotate image to straighten, keep full content in frame."""
    img = Image.open(img_path)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    orig_w, orig_h = img.size

    if abs(angle) < 0.3:
        return False  # Already straight enough

    # Rotate with expand to keep all content
    rotated = img.rotate(angle, resample=Image.BICUBIC, expand=True,
                         fillcolor=(255, 255, 255))

    # Trim the white border created by rotation
    rot_np = np.array(rotated)
    gray = cv2.cvtColor(rot_np, cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(gray, 248, 255, cv2.THRESH_BINARY_INV)
    coords = cv2.findNonZero(thresh)

    if coords is not None:
        x, y, cw, ch = cv2.boundingRect(coords)
        # Add small padding to not cut content
        pad = 5
        x = max(0, x - pad)
        y = max(0, y - pad)
        cw = min(rotated.width - x, cw + 2 * pad)
        ch = min(rotated.height - y, ch + 2 * pad)
        rotated = rotated.crop((x, y, x + cw, y + ch))

    # Resize back to original dimensions to keep file size consistent
    rotated = rotated.resize((orig_w, orig_h), Image.LANCZOS)

    # Save
    rotated.save(img_path, "WEBP", quality=85)
    return True


def main():
    # Backup originals if not done yet
    if not os.path.exists(BACKUP_DIR):
        print("Eerste keer: backup maken van originelen...")
        import shutil
        shutil.copytree(PRODUCTS_DIR, BACKUP_DIR)
        print(f"Backup gemaakt in {BACKUP_DIR}")

    # Find all product WebP images
    all_images = sorted(glob.glob(os.path.join(PRODUCTS_DIR, "*.webp")))
    print(f"Gevonden: {len(all_images)} afbeeldingen\n")

    straightened = 0
    already_straight = 0
    errors = 0

    for img_path in all_images:
        filename = os.path.basename(img_path)
        try:
            angle = detect_tilt_angle(img_path)

            if abs(angle) < 0.3:
                already_straight += 1
                continue

            if straighten_image(img_path, angle):
                straightened += 1
                direction = "CW" if angle > 0 else "CCW"
                print(f"  RECHT  {filename}  ({abs(angle):.1f}° {direction})")
            else:
                already_straight += 1

        except Exception as e:
            errors += 1
            print(f"  ERROR  {filename}: {e}")

    print(f"\nResultaat:")
    print(f"  Rechtgezet:    {straightened}")
    print(f"  Al recht:      {already_straight}")
    print(f"  Fouten:        {errors}")
    print(f"  Totaal:        {len(all_images)}")


if __name__ == "__main__":
    main()
