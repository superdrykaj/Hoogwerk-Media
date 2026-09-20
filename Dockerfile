# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Bouwfase
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# better-sqlite3 kan een native module moeten compileren.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# De build heeft geen echte sleutels nodig; die komen pas bij het draaien.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------------------------------------------------------------------------
# Draaifase
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Database en uploads staan op de gekoppelde schijf, niet in het image.
ENV DATA_DIR=/data

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# Eerst de serverbundel, daarna public en static eroverheen. Die laatste twee
# worden niet vanzelf meegenomen; zie de Next-documentatie bij output.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Aanmaken zodat de map bestaat als er (nog) geen schijf gekoppeld is.
RUN mkdir -p /data/uploads && chown -R nextjs:nodejs /data

# De container start als root en laat het startscript de rechten op de
# gekoppelde schijf goedzetten, waarna de server als nextjs verder draait.
# Zie docker-entrypoint.sh voor het waarom.
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Eventuele Windows-regeleindes weghalen. Met een \r achter de shebang zoekt
# de kernel naar "/bin/sh\r" en start de container niet op. .gitattributes
# voorkomt dit al, maar een bouwcontext kan ook anders tot stand komen.
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh
# Liever nu falen dan straks bij het opstarten op de server.
RUN if ! command -v setpriv >/dev/null; then \
      echo "setpriv ontbreekt in dit basisimage"; exit 1; \
    fi

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
