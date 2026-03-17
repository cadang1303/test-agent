import { existsSync } from "fs";
import { resolve } from "path";
import { pathToFileURL } from "url";

export const GITHUB_MODELS = {
  GPT_4O_MINI:   "gpt-4o-mini",                   // default — free, fast, great for code
  GPT_4O:        "gpt-4o",                         // more powerful, still free (rate-limited)
  LLAMA_3_3_70B: "Meta-Llama-3.3-70B-Instruct",   // open-source alternative
  PHI_4_MINI:    "Phi-4-mini-instruct",            // lightweight + fast
  DEEPSEEK_R1:   "DeepSeek-R1",                    // strong reasoning
};

const DEFAULTS = {
  model: GITHUB_MODELS.GPT_4O_MINI,
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
  apiKey: undefined,
};

export async function loadConfig(overrides = {}) {
  let config = { ...DEFAULTS };

  // Read env vars first so they can be overridden by config file or programmatic options
  if (process.env.GITHUB_TOKEN)                       config.apiKey      = process.env.GITHUB_TOKEN;
  if (process.env.REVIEWER_MODEL)                     config.model       = process.env.REVIEWER_MODEL;
  if (process.env.REVIEWER_SKILLS)                    config.skills      = process.env.REVIEWER_SKILLS.split(",").map(s => s.trim());
  if (process.env.REVIEWER_FAIL_ON_ERROR === "false") config.failOnError = false;

  // Try to load optional project-level config file (ai-reviewer.config.js)
  const configPath = resolve(process.cwd(), "ai-reviewer.config.js");
  if (existsSync(configPath)) {
    try {
      const projectConfig = await import(pathToFileURL(configPath).href);
      config = { ...config, ...(projectConfig.default ?? projectConfig) };
      console.log("📋  Loaded config from ai-reviewer.config.js");
    } catch (err) {
      console.warn(`⚠️  Could not load ai-reviewer.config.js: ${err.message}`);
    }
  }

  // Programmatic overrides win over everything (used by test-local.js and library callers)
  config = { ...config, ...overrides };

  return config;
}