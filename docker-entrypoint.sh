#!/bin/sh
# Startpunt van de container.
#
# Fly.io koppelt het volume als root. De rechten die in het image op /data
# zijn gezet, verdwijnen daardoor achter de koppeling: een proces dat niet
# als root draait kan er dan niet in schrijven, en de server komt niet op.
#
# Daarom start deze container als root, zet de eigenaar van de gegevensmap
# goed, en draait de server daarna alsnog als de gewone gebruiker.
set -e

DATA_DIR="${DATA_DIR:-/data}"
APP_UID=1001
APP_GID=1001

mkdir -p "$DATA_DIR/uploads"

# Alleen aanpassen als het nodig is: op een volle schijf met veel uploads
# scheelt dat werk bij elke start.
if [ "$(stat -c %u "$DATA_DIR")" != "$APP_UID" ]; then
  echo "[hoogbeeld-media] Eigenaar van $DATA_DIR goedzetten voor de app."
  chown -R "$APP_UID:$APP_GID" "$DATA_DIR"
fi

exec setpriv --reuid="$APP_UID" --regid="$APP_GID" --init-groups "$@"
