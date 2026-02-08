#!/bin/bash
# Batch cover art processing script
# Save downloaded images to current directory, then run this

for image in *.png *.jpg *.jpeg; do
  [ -f "$image" ] || continue
  echo "Converting: $image"
  convert "$image" -resize 500x500 -quality 85 "${image%.*}.webp"
  rm "$image"
done

echo "✅ All images converted to WebP"
echo "Move .webp files to: public/images/products/"
echo "Then run: npm run build"
