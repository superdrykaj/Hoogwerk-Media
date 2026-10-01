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

# Optioneel: eenmalig de diensten en tarieven van oktober 2026 bijwerken.
# Staat alleen aan als TARIFF_UPDATE=2026-10 is gezet (nu alleen in
# fly.staging.toml, dus niet op productie). Het script maakt eerst een
# back-up, slaat zelf aangepaste diensten over en doet bij een tweede keer
# niets. Het draait als de gewone gebruiker, zodat de databasebestanden niet
# van root worden, en vóór de server start. Mislukt het, dan start de server
# toch gewoon.
if [ "${TARIFF_UPDATE:-}" = "2026-10" ]; then
  echo "[hoogbeeld-media] Tarievenupdate 2026-10 uitvoeren."
  setpriv --reuid="$APP_UID" --regid="$APP_GID" --init-groups \
    node scripts/onderhoud/tarieven-2026-10.cjs \
    || echo "[hoogbeeld-media] Tarievenupdate mislukt; de server start toch."
fi

exec setpriv --reuid="$APP_UID" --regid="$APP_GID" --init-groups "$@"
