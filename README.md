# Windows Spotlight Wallpaper

Windows Spotlight Wallpaper is an independent GNOME Shell extension that fetches Microsoft Windows Spotlight images through the Iris service. It is derived from Bing Wallpaper and uses the Spotlight source adapter ported from Equinox.

## Project identity

| Item | Value |
| --- | --- |
| Display name | Windows Spotlight Wallpaper |
| Extension UUID | `windows-spotlight-wallpaper@local` |
| Settings schema | `org.gnome.shell.extensions.windows-spotlight-wallpaper` |
| Settings path | `/org/gnome/shell/extensions/windows-spotlight-wallpaper/` |
| Translation domain | `WindowsSpotlightWallpaper` |
| Default collection folder | `WindowsSpotlightWallpaper/` inside Pictures, with Desktop as a fallback |
| Exported history | `spotlight.json` in the collection folder |
| Installation package | `windows-spotlight-wallpaper@local.zip` |

GNOME recognizes this extension separately from the original `BingWallpaper@ineffable-gmail.com`. Its settings, startup state, history, favourites and default collection folder are independent. Existing Bing Wallpaper settings are not migrated automatically. Choose which extension should set your desktop wallpaper automatically.

## Features

- Windows Spotlight images in their original resolution.
- Refresh every four hours, with an English/US fallback when a region returns no images.
- Wallpaper history, favourites, gallery, manual selection and shuffle.
- Desktop and lock screen wallpaper controls, notifications and optional lock screen blur controls inherited from the upstream extension.

## Requirements

This branch supports GNOME 3.36, 3.38 and 40–44, including GNOME 42. GNOME 45 and later require a port to the newer extension API.

Building requires Python 3, `glib-compile-schemas` and `msgfmt`. The installer also uses `unzip` and `gnome-extensions`. Tests require GJS.

## Build

From the project directory:

```sh
bash buildzip.sh
```

This creates `windows-spotlight-wallpaper@local.zip` with the independent metadata, compiled settings schema and translations.

## Install

```sh
bash install.sh
```

The installer uses the UUID from `metadata.json` and writes to `${XDG_DATA_HOME:-$HOME/.local/share}/gnome-shell/extensions/windows-spotlight-wallpaper@local/`. It enables only this extension. If GNOME has not discovered it yet, refresh GNOME Shell or log out and back in, then enable **Windows Spotlight Wallpaper** in the extension manager.

The ZIP can also be installed with:

```sh
gnome-extensions install --force windows-spotlight-wallpaper@local.zip
```

## Test

```sh
npm test
```

Tests exercise the Spotlight response parser and verify settings isolation and runtime type coexistence with the original extension. Settings tests use a memory backend and temporary files.

## Debug logging

Enable debug logging in preferences, or inspect this extension's settings with:

```sh
GSETTINGS_SCHEMA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/gnome-shell/extensions/windows-spotlight-wallpaper@local/schemas" dconf-editor /org/gnome/shell/extensions/windows-spotlight-wallpaper/
```

## Credits and license

This project is based on [Bing Wallpaper by Michael Carroll](https://github.com/neffo/bing-wallpaper-gnome-extension), itself derived from [NASA APOD by Elia Argentieri](https://github.com/Elinvention/gnome-shell-extension-nasa-apod). The Spotlight adapter is based on Equinox's `spotlight.rs`. Lock screen blur code also credits [Pratap Kumar](https://github.com/PRATAP-KUMAR/Control_Blur_Effect_On_Lock_Screen) and [sunwxg](https://github.com/sunwxg/gnome-shell-extension-unlockDialogBackground).

Original copyright and license notices are retained in the source files. See [LICENSE](LICENSE).

This is an unofficial project and is not affiliated with Microsoft. Wallpaper images remain copyrighted by their respective owners.
