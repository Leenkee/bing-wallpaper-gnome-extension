#!/bin/bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
glib-compile-schemas --strict schemas/
# Existing translations are unchanged; compile them without regenerating catalogs.
while IFS= read -r -d '' catalog; do
    msgfmt -o "${catalog%.po}.mo" "$catalog"
done < <(find locale -name '*.po' -print0)
python3 - <<'PY'
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

metadata = json.loads(Path('metadata.json').read_text())
package = metadata['uuid'] + '.zip'
with ZipFile(package, 'w', ZIP_DEFLATED) as archive:
    for path in sorted(Path('.').rglob('*')):
        if not path.is_file():
            continue
        root = path.parts[0]
        if (len(path.parts) == 1 and (path.suffix == '.js' and not path.name.startswith('test') or path.name in ('metadata.json', 'stylesheet.css', 'LICENSE', 'README.md'))) or root in ('schemas', 'icons', 'ui') or (root == 'locale' and path.name == metadata['gettext-domain'] + '.mo'):
            archive.write(path)
print('Built ' + package)
PY
