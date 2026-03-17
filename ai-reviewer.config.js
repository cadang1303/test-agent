/**
 * ai-reviewer.config.js
 *
 * Drop this file into your project root to customise the AI reviewer.
 * All fields are optional — unset fields fall back to package defaults.
 *
 * @type {import('ai-pr-reviewer').Config}
 */
export default {
  // ── Model ──────────────────────────────────────────────────────────────
  // claude-haiku-4-5-20251001 = fast & cheap (great for testing)
  // claude-sonnet-4-6         = smarter, balanced cost (recommended for production)
  // claude-opus-4-6           = most capable (expensive, for critical repos)
  model: "claude-haiku-4-5-20251001",

  // ── Skills to enable ───────────────────────────────────────────────────
  // Available: convention | lint | security | logic | tests | performance | types
  skills: ["convention", "lint", "security", "logic", "tests"],

  // ── Fail CI on errors ──────────────────────────────────────────────────
  // Set to false to post comments without blocking merge
  failOnError: true,

  // ── Files / patterns to ignore ─────────────────────────────────────────
  ignorePatterns: [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".min.js",
    ".min.css",
    "dist/",
    "build/",
    "__snapshots__/",
    "migrations/",
    ".svg",
    ".png",
    ".jpg",
    ".ico",
  ],

  // ── Max tokens per diff chunk ──────────────────────────────────────────
  // Larger = fewer API calls but more expensive per call
  maxTokensPerChunk: 3000,
};
