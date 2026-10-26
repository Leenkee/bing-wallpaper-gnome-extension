#!/bin/bash
set -euo pipefail
cd -- "$(dirname -- "$0")"

EXTENSION_UUID=$(python3 -c 'import json; print(json.load(open("metadata.json"))["uuid"])')
INSTALL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/gnome-shell/extensions/$EXTENSION_UUID"
ZIP_NAME="$EXTENSION_UUID.zip"

./buildzip.sh

mkdir -p "$INSTALL_DIR"
unzip -oq "$ZIP_NAME" -d "$INSTALL_DIR/"

if gnome-extensions enable "$EXTENSION_UUID"; then
    printf 'Installed and enabled %s\n' "$EXTENSION_UUID"
else
    printf 'Installed %s. Refresh GNOME Shell, then enable Windows Spotlight Wallpaper in the extension manager.\n' "$EXTENSION_UUID"
fi
