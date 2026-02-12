#!/usr/bin/env python3
"""Straighten ALL product photos v2 — contour-based rotation detection.

Uses minAreaRect on the largest contour (the game case/cartridge) to detect
the exact tilt angle. Falls back to Hough line detection. Much more aggressive
than v1 which barely rotated anything.
"""

import os
import glob
import cv2
import numpy as np
from PIL import Image, ImageOps

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS_DIR = os.path.join(BASE, "public", "images", "products")
BACKUP_DIR = os.path.join(BASE, "public", "images", "products_backup")


def detect_angle_contour(img_path):
    """Detect tilt via minAreaRect on the largest object contour."""
    img = cv2.imread(img_path)
    if img is None:
        return None

    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Multiple threshold strategies
    angles = []

    for thresh_val in [200, 220, 240]:
        _, thresh = cv2.threshold(gray, thresh_val, 255, cv2.THRESH_BINARY_INV)

        # Clean up noise
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)

        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            continue

        # Get largest contour that covers significant area
        largest = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(largest)
        img_area = h * w

        # Contour must be at least 10% of image
        if area < img_area * 0.10:
            continue

        rect = cv2.minAreaRect(largest)
        angle = rect[2]
        rect_w, rect_h = rect[1]

        # Normalize angle based on aspect ratio
        if rect_w < rect_h:
            # Portrait orientation (most game cases)
            # angle is already relative to vertical
            pass
        else:
            # Landscape orientation
            angle = angle - 90 if angle > 0 else angle + 90

        # Clamp to reasonable range (-20 to +20)
        if abs(angle) > 20:
            if angle > 45:
                angle -= 90
            elif angle < -45:
                angle += 90

        if abs(angle) <= 20:
            angles.append(angle)

    if not angles:
        return None

    return np.median(angles)


def detect_angle_hough(img_path):
    """Fallback: detect tilt via Hough line detection on edges."""
    img = cv2.imread(img_path)
    if img is None:
        return None

    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 30, 100, apertureSize=3)

    # Focus on outer region where case edges are (outer 35% of image)
    mask = np.zeros_like(edges)
    border_x = int(w * 0.35)
    border_y = int(h * 0.35)
    # Left strip
    mask[:, :border_x] = 255
    # Right strip
    mask[:, w - border_x:] = 255
    # Top strip
    mask[:border_y, :] = 255
    # Bottom strip
    mask[h - border_y:, :] = 255
    edges = cv2.bitwise_and(edges, mask)

    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=50,
                            minLineLength=max(w, h) * 0.10,
                            maxLineGap=20)
    if lines is None:
        return None

    vertical_angles = []
    horizontal_angles = []

    for line in lines:
        x1, y1, x2, y2 = line[0]
        length = np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        if length < max(w, h) * 0.08:
            continue

        angle_from_vert = np.degrees(np.arctan2(x2 - x1, y2 - y1))
        angle_from_horiz = np.degrees(np.arctan2(y2 - y1, x2 - x1))

        if abs(angle_from_vert) < 25:
            vertical_angles.append((angle_from_vert, length))
        if abs(angle_from_horiz) < 25:
            horizontal_angles.append((angle_from_horiz, length))

    # Weight by line length
    if len(vertical_angles) >= 2:
        total_len = sum(l for _, l in vertical_angles)
        angle = sum(a * l for a, l in vertical_angles) / total_len
    elif len(horizontal_angles) >= 2:
        total_len = sum(l for _, l in horizontal_angles)
        angle = sum(a * l for a, l in horizontal_angles) / total_len
    elif vertical_angles:
        angle = vertical_angles[0][0]
    elif horizontal_angles:
        angle = horizontal_angles[0][0]
    else:
        return None

    if abs(angle) > 20:
        return None

    return angle


def detect_tilt_angle(img_path):
    """Combine contour and hough methods for best result."""
    contour_angle = detect_angle_contour(img_path)
    hough_angle = detect_angle_hough(img_path)

    if contour_angle is not None and hough_angle is not None:
        # If both agree on direction, average them (weighted toward contour)
        if (contour_angle > 0) == (hough_angle > 0):
            return contour_angle * 0.6 + hough_angle * 0.4
        # If they disagree, prefer the one with larger absolute value
        # (more likely to be the real tilt)
        return contour_angle if abs(contour_angle) > abs(hough_angle) else hough_angle
    elif contour_angle is not None:
        return contour_angle
    elif hough_angle is not None:
        return hough_angle
    else:
        return 0


def straighten_image(img_path, angle):
    """Rotate image to straighten, keep full content in frame."""
    img = Image.open(img_path)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    orig_w, orig_h = img.size

    if abs(angle) < 0.5:
        return False

    # Rotate with expand to keep all content
    rotated = img.rotate(angle, resample=Image.BICUBIC, expand=True,
                         fillcolor=(255, 255, 255))

    # Trim the white border created by rotation
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

    # Save
    rotated.save(img_path, "WEBP", quality=85)
    return True


def main():
    if not os.path.exists(BACKUP_DIR):
        print("FOUT: Geen backup gevonden! Kan niet herstellen.")
        return

    # Restore ALL images from backup first
    import shutil
    backup_images = sorted(glob.glob(os.path.join(BACKUP_DIR, "*.webp")))
    print(f"Herstellen van {len(backup_images)} originelen uit backup...")
    for bak in backup_images:
        filename = os.path.basename(bak)
        dst = os.path.join(PRODUCTS_DIR, filename)
        shutil.copy2(bak, dst)
    print("Originelen hersteld.\n")

    # Process all product images
    all_images = sorted(glob.glob(os.path.join(PRODUCTS_DIR, "*.webp")))
    print(f"Gevonden: {len(all_images)} afbeeldingen\n")

    straightened = 0
    already_straight = 0
    errors = 0

    for img_path in all_images:
        filename = os.path.basename(img_path)
        try:
            angle = detect_tilt_angle(img_path)

            if abs(angle) < 0.5:
                already_straight += 1
                continue

            if straighten_image(img_path, angle):
                straightened += 1
                direction = "CW" if angle > 0 else "CCW"
                print(f"  RECHT  {filename}  ({abs(angle):.1f} {direction})")
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
