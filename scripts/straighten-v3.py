#!/usr/bin/env python3
"""Straighten ALL product photos v3 — with direction verification.

Detects tilt angle via contour+hough, then VERIFIES the correct rotation
direction by trying both +angle and -angle and picking the one with
better vertical/horizontal edge alignment.
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


def alignment_score(pil_img):
    """Score how well edges in the image align with vertical/horizontal axes.
    Higher = more aligned = straighter image."""
    img_np = np.array(pil_img)
    if len(img_np.shape) == 3:
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    else:
        gray = img_np

    edges = cv2.Canny(gray, 50, 150)
    h, w = edges.shape

    # Sample columns for vertical alignment
    vert_score = 0
    step = max(1, w // 60)
    for col in range(0, w, step):
        col_pixels = edges[:, col]
        positions = np.where(col_pixels > 0)[0]
        if len(positions) > 1:
            diffs = np.diff(positions)
            vert_score += np.sum(diffs == 1)

    # Sample rows for horizontal alignment
    horiz_score = 0
    step = max(1, h // 60)
    for row in range(0, h, step):
        row_pixels = edges[row, :]
        positions = np.where(row_pixels > 0)[0]
        if len(positions) > 1:
            diffs = np.diff(positions)
            horiz_score += np.sum(diffs == 1)

    return vert_score + horiz_score


def detect_angle_contour(img_cv):
    """Detect tilt via minAreaRect on the largest contour."""
    h, w = img_cv.shape[:2]
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

    best_angle = None
    best_area = 0

    for thresh_val in [190, 210, 230]:
        _, thresh = cv2.threshold(gray, thresh_val, 255, cv2.THRESH_BINARY_INV)

        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)

        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            continue

        largest = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(largest)

        if area < h * w * 0.08:
            continue

        if area > best_area:
            best_area = area
            rect = cv2.minAreaRect(largest)
            angle = rect[2]
            rect_w, rect_h = rect[1]

            # Normalize: we want the deviation from the nearest axis
            if rect_w < rect_h:
                # Rectangle is taller than wide (portrait)
                # angle is deviation from vertical
                pass
            else:
                # Rectangle is wider than tall (landscape)
                angle = angle - 90 if angle > -45 else angle + 90

            # Keep within ±45
            if angle > 45:
                angle -= 90
            elif angle < -45:
                angle += 90

            best_angle = angle

    return best_angle


def detect_angle_hough(img_cv):
    """Detect tilt via Hough line detection on edges."""
    h, w = img_cv.shape[:2]
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 30, 100, apertureSize=3)

    # Focus on outer 35% region
    mask = np.zeros_like(edges)
    bx = int(w * 0.35)
    by = int(h * 0.35)
    mask[:, :bx] = 255
    mask[:, w - bx:] = 255
    mask[:by, :] = 255
    mask[h - by:, :] = 255
    edges = cv2.bitwise_and(edges, mask)

    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=40,
                            minLineLength=max(w, h) * 0.08,
                            maxLineGap=20)
    if lines is None:
        return None

    angles_weighted = []

    for line in lines:
        x1, y1, x2, y2 = line[0]
        length = np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        if length < max(w, h) * 0.06:
            continue

        angle_vert = np.degrees(np.arctan2(x2 - x1, y2 - y1))

        if abs(angle_vert) < 25:
            angles_weighted.append((angle_vert, length))

    if not angles_weighted:
        return None

    total_len = sum(l for _, l in angles_weighted)
    if total_len == 0:
        return None

    weighted_angle = sum(a * l for a, l in angles_weighted) / total_len

    if abs(weighted_angle) > 25:
        return None

    return weighted_angle


def detect_raw_angle(img_path):
    """Get the raw detected angle (magnitude) from both methods."""
    img_cv = cv2.imread(img_path)
    if img_cv is None:
        return 0

    contour_angle = detect_angle_contour(img_cv)
    hough_angle = detect_angle_hough(img_cv)

    if contour_angle is not None and hough_angle is not None:
        # Use the average magnitude
        return (abs(contour_angle) + abs(hough_angle)) / 2
    elif contour_angle is not None:
        return abs(contour_angle)
    elif hough_angle is not None:
        return abs(hough_angle)
    return 0


def find_best_rotation(img_path, magnitude):
    """Try rotating +magnitude and -magnitude, return the angle with better alignment."""
    if magnitude < 0.5:
        return 0

    img = Image.open(img_path)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    # Score original (no rotation)
    score_orig = alignment_score(img)

    # Try positive rotation (CCW in PIL = corrects CW tilt)
    rotated_pos = img.rotate(magnitude, resample=Image.BICUBIC, expand=True,
                             fillcolor=(255, 255, 255))
    score_pos = alignment_score(rotated_pos)

    # Try negative rotation (CW in PIL = corrects CCW tilt)
    rotated_neg = img.rotate(-magnitude, resample=Image.BICUBIC, expand=True,
                             fillcolor=(255, 255, 255))
    score_neg = alignment_score(rotated_neg)

    # Pick the best option
    best_score = max(score_orig, score_pos, score_neg)

    if best_score == score_orig and best_score > score_pos * 0.95:
        return 0  # Original is already the best or very close
    elif score_pos >= score_neg:
        return magnitude
    else:
        return -magnitude


def straighten_image(img_path, angle):
    """Rotate image to straighten, keep full content in frame."""
    img = Image.open(img_path)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    orig_w, orig_h = img.size

    if abs(angle) < 0.5:
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
        pad = 3
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

    for img_path in all_images:
        filename = os.path.basename(img_path)
        try:
            # Step 1: Detect the magnitude of tilt
            magnitude = detect_raw_angle(img_path)

            if magnitude < 0.5:
                already_straight += 1
                continue

            # Clamp magnitude to reasonable range
            magnitude = min(magnitude, 18)

            # Step 2: Find the CORRECT direction by trying both
            best_angle = find_best_rotation(img_path, magnitude)

            if abs(best_angle) < 0.5:
                already_straight += 1
                continue

            # Step 3: Apply the rotation
            if straighten_image(img_path, best_angle):
                straightened += 1
                direction = "CCW" if best_angle > 0 else "CW"
                print(f"  RECHT  {filename}  ({abs(best_angle):.1f} {direction})")
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
