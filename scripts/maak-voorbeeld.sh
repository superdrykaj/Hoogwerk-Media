#!/usr/bin/env bash
# Maakt van een video een kort, verkleind voorbeeld met watermerk, om in Beheer
# bij het bestand te uploaden ("Voorbeeld uploaden"). Draai dit op je eigen
# computer; de server doet dit bewust niet (te zwaar voor de kleine machine).
#
#   scripts/maak-voorbeeld.sh film.mp4              # voorbeeld van de eerste 45 seconden
#   scripts/maak-voorbeeld.sh film.mp4 90           # de eerste 90 seconden
#
# Resultaat: film-voorbeeld.mp4 naast het origineel. 720p, het logo drie keer
# over het beeld, geen losse sporen van het origineel. Vereist ffmpeg.
set -euo pipefail

invoer="${1:?Geef een videobestand op, bijvoorbeeld: $0 film.mp4}"
seconden="${2:-45}"
logo="$(cd "$(dirname "$0")/.." && pwd)/public/logo-mark.png"
uitvoer="${invoer%.*}-voorbeeld.mp4"

[ -f "$invoer" ] || { echo "Bestand niet gevonden: $invoer" >&2; exit 1; }
[ -f "$logo" ] || { echo "Logo niet gevonden: $logo" >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg is niet geïnstalleerd." >&2; exit 1; }

ffmpeg -hide_banner -loglevel error -y -t "$seconden" -i "$invoer" -i "$logo" \
  -filter_complex "[0:v]scale=-2:720,setsar=1[v];\
[1:v]scale=220:-1,format=rgba,colorchannelmixer=aa=0.55,split=3[w1][w2][w3];\
[v][w1]overlay=W*0.08:H*0.12[a];\
[a][w2]overlay=(W-w)/2:(H-h)/2[b];\
[b][w3]overlay=W*0.92-w:H*0.88-h,format=yuv420p[out]" \
  -map "[out]" -map "0:a?" \
  -c:v libx264 -preset veryfast -crf 29 -c:a aac -b:a 96k \
  -map_metadata -1 -movflags +faststart "$uitvoer"

echo "Klaar: $uitvoer ($(du -h "$uitvoer" | cut -f1)). Upload dit in Beheer bij het bestand."
