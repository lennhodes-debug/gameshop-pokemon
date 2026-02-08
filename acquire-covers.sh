#!/bin/bash

# IMAGE ACQUISITION HELPER
#
# Batch downloads cover art for missing products
# Usage: bash acquire-covers.sh

set -e

TEMP_DIR=".cover-art-temp"
MANIFEST="MISSING_COVERS_MANIFEST.json"

if [ ! -f "$MANIFEST" ]; then
  echo "❌ MANIFEST not found: $MANIFEST"
  exit 1
fi

echo "🎮 Image Acquisition Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 WORKFLOW:"
echo ""
echo "1. For each product in MISSING_COVERS_MANIFEST.json:"
echo "   - Open PriceCharting URL"
echo "   - Find PAL/EUR region cover art"
echo "   - Download highest resolution image"
echo "   - Verify: professional quality, no damage"
echo ""
echo "2. Save to: $TEMP_DIR/"
echo "   Naming: [SKU]-[game-name].png"
echo "   Example: SW-042-zelda-botw.png"
echo ""
echo "3. System will auto-deploy:"
echo "   - Validate quality"
echo "   - Convert to WebP 500x500"
echo "   - Update products.json"
echo "   - Commit and push"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Total to find: $(jq length < $MANIFEST)"
echo ""
