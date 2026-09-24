import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  // Dezelfde "@/"-verwijzingen als in tsconfig.json, zodat een test hetzelfde
  // importeert als de applicatie.
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, ".") },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
