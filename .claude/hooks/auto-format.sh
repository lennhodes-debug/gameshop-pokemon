#!/bin/bash
# Auto-format hook: draait Prettier op bestanden na Write/Edit
# Alleen voor .ts, .tsx, .css, .json bestanden

FILE_PATH="$CLAUDE_FILE_PATH"

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Check of het een formateerbaar bestand is
case "$FILE_PATH" in
  *.ts|*.tsx|*.css|*.json)
    # Prettier draaien (als het geïnstalleerd is)
    if command -v npx &> /dev/null; then
      npx --yes prettier --write "$FILE_PATH" 2>/dev/null
    fi
    ;;
esac

exit 0
