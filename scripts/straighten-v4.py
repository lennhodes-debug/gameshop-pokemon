#!/usr/bin/env python3
"""Straighten ALL product photos v4 — brute-force optimal angle search.

Instead of trying to detect the angle via line/contour analysis (which fails
on complex game artwork), this script tries multiple rotation angles and picks
the one that minimizes the axis-aligned bounding box of the main object.

A tilted rectangle has a LARGER bounding box than a straight one, so minimizing
the bounding box area = finding the straightest orientation.
"""

import os
import glob
import shutil
import cv2
import numpy as np
from PIL import Image, ImageOps

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS_DIR = os.path.join(BASE, "public", "images", "products")
BACKUP_DIR = os.path.join(BASE, "public", "images", "products_backup")


def get_object_bbox_area(pil_img):
    """Get the axis-aligned bounding box area of the main object.
    Smaller = more aligned with axes = straighter."""
    img_np = np.array(pil_img)
    if len(img_np.shape) == 3:
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    else:
        gray = img_np

    # Threshold to find dark objects on light background
    _, thresh = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY_INV)

    # Clean up
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=3)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)

    coords = cv2.findNonZero(thresh)
    if coords is None:
        return float('inf')

    x, y, w, h = cv2.boundingRect(coords)
    return w * h


def find_optimal_angle(img_path):
    """Brute-force search for the rotation angle that minimizes bounding box area."""
    img = Image.open(img_path)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    # Coarse search: -15 to +15 in 2° steps
    coarse_angles = [a for a in range(-15, 16, 2)]
    best_angle = 0
    best_area = get_object_bbox_area(img)

    for angle in coarse_angles:
        if angle == 0:
            continue
        rotated = img.rotate(angle, resample=Image.BICUBIC, expand=True,
                             fillcolor=(255, 255, 255))
        area = get_object_bbox_area(rotated)
        if area < best_area:
            best_area = area
            best_angle = angle

    # Fine search: best_angle ± 2° in 0.5° steps
    fine_start = best_angle - 2
    fine_end = best_angle + 2
    fine_angles = [fine_start + i * 0.5 for i in range(int((fine_end - fine_start) / 0.5) + 1)]

    for angle in fine_angles:
        if abs(angle) < 0.3:
            area = get_object_bbox_area(img)
        else:
            rotated = img.rotate(angle, resample=Image.BICUBIC, expand=True,
                                 fillcolor=(255, 255, 255))
            area = get_object_bbox_area(rotated)
        if area < best_area:
            best_area = area
            best_angle = angle

    return best_angle


def straighten_image(img_path, angle):
    """Rotate image to straighten, keep full content in frame."""
    img = Image.open(img_path)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    orig_w, orig_h = img.size

    if abs(angle) < 0.3:
        return False

    rotated = img.rotate(angle, resample=Image.BICUBIC, expand=True,
                         fillcolor=(255, 255, 255))

    # Trim white border
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

    # Resize back to original dimensions
    rotated = rotated.resize((orig_w, orig_h), Image.LANCZOS)

    rotated.save(img_path, "WEBP", quality=85)
    return True


def main():
    if not os.path.exists(BACKUP_DIR):
        print("FOUT: Geen backup gevonden!")
        return

    # Restore from backup
    backup_images = sorted(glob.glob(os.path.join(BACKUP_DIR, "*.webp")))
    print(f"Herstellen van {len(backup_images)} originelen uit backup...")
    for bak in backup_images:
        filename = os.path.basename(bak)
        dst = os.path.join(PRODUCTS_DIR, filename)
        shutil.copy2(bak, dst)
    print("Originelen hersteld.\n")

    all_images = sorted(glob.glob(os.path.join(PRODUCTS_DIR, "*.webp")))
    print(f"Gevonden: {len(all_images)} afbeeldingen\n")

    straightened = 0
    already_straight = 0
    errors = 0

    for i, img_path in enumerate(all_images):
        filename = os.path.basename(img_path)
        try:
            angle = find_optimal_angle(img_path)

            if abs(angle) < 0.3:
                already_straight += 1
                continue

            if straighten_image(img_path, angle):
                straightened += 1
                direction = "CCW" if angle > 0 else "CW"
                print(f"  [{i+1}/{len(all_images)}] RECHT  {filename}  ({abs(angle):.1f} {direction})")
            else:
                already_straight += 1

        except Exception as e:
            errors += 1
            print(f"  [{i+1}/{len(all_images)}] ERROR  {filename}: {e}")

        # Progress indicator every 50 images
        if (i + 1) % 50 == 0:
            print(f"  --- Voortgang: {i+1}/{len(all_images)} ---")

    print(f"\nResultaat:")
    print(f"  Rechtgezet:    {straightened}")
    print(f"  Al recht:      {already_straight}")
    print(f"  Fouten:        {errors}")
    print(f"  Totaal:        {len(all_images)}")


if __name__ == "__main__":
    main()
