"use strict";

/**
 * De standalone Next-server maakt zijn Node HTTP-server intern aan. Node zet
 * standaard een totale requestTimeout van vijf minuten op die server. Dat is
 * te kort voor grote opleverbestanden: ook een upload die onafgebroken data
 * verstuurt, wordt na die totale duur afgebroken.
 *
 * Deze preload draait vóór .next/standalone/server.js en past uitsluitend de
 * requestTimeout aan op nieuw aangemaakte HTTP-servers. headersTimeout blijft
 * bewust ongemoeid, zodat trage/onvolledige requestheaders wel begrensd zijn.
 *
 * 0 betekent volgens Node: geen totale request-timeout. Fly Proxy bewaakt nog
 * steeds verbindingen waarop helemaal geen bytes meer worden verstuurd.
 */
// Een `--require`-preload moet CommonJS zijn; ESM draait hiervoor te laat.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const http = require("node:http");

const rawTimeout = process.env.SERVER_REQUEST_TIMEOUT_MS ?? "0";
const requestTimeout = Number(rawTimeout);

if (!Number.isSafeInteger(requestTimeout) || requestTimeout < 0) {
  throw new Error(
    `SERVER_REQUEST_TIMEOUT_MS moet een niet-negatief geheel getal zijn; ontvangen: ${rawTimeout}`,
  );
}

const createServer = http.createServer;

http.createServer = function createServerWithoutShortRequestTimeout(...args) {
  const server = Reflect.apply(createServer, this, args);
  server.requestTimeout = requestTimeout;
  return server;
};
