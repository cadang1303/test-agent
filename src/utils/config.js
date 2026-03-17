import { existsSync } from "fs";
import { resolve } from "path";

const DEFAULTS = {
  // Use claude-haiku-4-5 for cheap/fast testing; swap to claude-sonnet-4-6 for production
  model: "claude-haiku-4-5-20251001",
  skills: ["convention", "lint", "security", "logic", "tests"],
  ignorePatterns: [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".min.js",
    ".min.css",
    "dist/",
    "build/",
    "__snapshots__/",
    ".svg",
    ".png",
    ".jpg",
  ],
  maxTokensPerChunk: 3000,
  failOnError: true,
  language: "auto", // auto-detect from file extension
};

export function loadConfig(overrides = {}) {
  // 1. Start with defaults
  let config = { ...DEFAULTS };

  // 2. Try to load project-level config file
  const configPath = resolve(process.cwd(), "ai-reviewer.config.js");
  if (existsSync(configPath)) {
    try {
      const projectConfig = await import(configPath);
      config = { ...config, ...(projectConfig.default ?? projectConfig) };
      console.log("📋  Loaded config from ai-reviewer.config.js");
    } catch {
      // Config file is optional — ignore errors
    }
  }

  // 3. Apply env var overrides
  if (process.env.ANTHROPIC_API_KEY) config.apiKey = process.env.ANTHROPIC_API_KEY;
  if (process.env.REVIEWER_MODEL) config.model = process.env.REVIEWER_MODEL;
  if (process.env.REVIEWER_SKILLS) config.skills = process.env.REVIEWER_SKILLS.split(",").map(s => s.trim());
  if (process.env.REVIEWER_FAIL_ON_ERROR === "false") config.failOnError = false;

  // 4. Apply programmatic overrides (when used as library)
  config = { ...config, ...overrides };

  return config;
}
