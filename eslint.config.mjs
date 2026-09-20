import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "data/**",
    "node_modules/**",
  ]),
  {
    // Onderhoudsscripts draaien met `node` in de container, buiten de
    // serverbundel om. Daar bestaat geen bundler, dus daar hoort require().
    files: ["scripts/onderhoud/**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);
