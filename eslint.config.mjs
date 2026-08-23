import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The Sonora marketing site is a separate Astro project with its own
    // toolchain. It is not part of the Mapped app build.
    "sonora/**",
  ]),
  {
    rules: {
      // CRITICAL — these catch real crashes (e.g. React error #310,
      // "rendered more hooks than during the previous render").
      // Never downgrade these.
      "react-hooks/rules-of-hooks": "error",

      // Downgraded to warnings for now — real issues, but 80+ existing
      // violations would block every deploy. Burn these down over time,
      // then promote back to "error".
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "warn",
      "react/no-unescaped-entities": "warn",
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
]);

export default eslintConfig;
