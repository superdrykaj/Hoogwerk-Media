import { execFileSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

const preload = path.join(process.cwd(), "scripts", "configure-http-server.cjs");

function inspectTimeouts(timeout?: string) {
  const env = { ...process.env };
  if (timeout === undefined) {
    delete env.SERVER_REQUEST_TIMEOUT_MS;
  } else {
    env.SERVER_REQUEST_TIMEOUT_MS = timeout;
  }

  const output = execFileSync(
    process.execPath,
    [
      "--require",
      preload,
      "--eval",
      "const server = require('node:http').createServer(); process.stdout.write(JSON.stringify({ requestTimeout: server.requestTimeout, headersTimeout: server.headersTimeout })); server.close();",
    ],
    { encoding: "utf8", env },
  );

  return JSON.parse(output) as { requestTimeout: number; headersTimeout: number };
}

describe("configure-http-server preload", () => {
  it("schakelt standaard alleen de totale request-timeout uit", () => {
    expect(inspectTimeouts()).toEqual({
      requestTimeout: 0,
      headersTimeout: 60_000,
    });
  });

  it("accepteert een expliciete langere request-timeout", () => {
    expect(inspectTimeouts("7200000")).toEqual({
      requestTimeout: 7_200_000,
      headersTimeout: 60_000,
    });
  });
});
