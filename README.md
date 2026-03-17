# ai-pr-reviewer

AI-powered pull request code reviewer using Claude. Drop into any GitHub project via one workflow file — no code changes needed.

## Features

- 🔍 **7 review skills**: convention, lint, security, logic, tests, performance, types
- 🌐 **Multi-language**: JS/TS, Python, Go, Java, Ruby, Rust, PHP, C#, C++
- 💬 **Inline PR comments** on the exact diff lines with issues
- 📊 **PR summary comment** with severity breakdown per file
- ❌ **CI gate**: optionally fail the check on errors to block merging
- 🔧 **Per-project config** via `ai-reviewer.config.js`
- 💰 **Cheap for testing**: defaults to `claude-haiku-4-5` (~$0.001 per review)

---

## Quick start (2 steps)

### 1. Add the secret

In your GitHub repo: **Settings → Secrets → Actions → New repository secret**

```
Name:  ANTHROPIC_API_KEY
Value: sk-ant-...
```

### 2. Add the workflow

Copy `templates/ai-review.yml` to `.github/workflows/ai-review.yml` in your project.

That's it — every new commit to a PR will trigger a review.

---

## Use as a library

```js
import { reviewFiles } from "ai-pr-reviewer";

const results = await reviewFiles(files, {
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: "claude-haiku-4-5-20251001",
  skills: ["security", "logic"],
});
```

---

## Project-level config

Create `ai-reviewer.config.js` in your project root:

```js
export default {
  model: "claude-haiku-4-5-20251001",  // cheap for testing
  // model: "claude-sonnet-4-6",        // upgrade for production
  skills: ["convention", "lint", "security", "logic", "tests"],
  failOnError: true,
  ignorePatterns: ["dist/", "*.min.js", "migrations/"],
};
```

---

## Models

| Model | Speed | Cost | Best for |
|---|---|---|---|
| `claude-haiku-4-5-20251001` | ⚡ Fast | 💚 Cheapest | Testing, high-volume |
| `claude-sonnet-4-6` | ⚖️ Balanced | 💛 Moderate | Production |
| `claude-opus-4-6` | 🧠 Thorough | 🔴 Premium | Critical/security reviews |

---

## Test locally

```bash
ANTHROPIC_API_KEY=sk-ant-... node src/test-local.js
```

---

## Skills

| Skill | What it checks |
|---|---|
| `convention` | Naming, formatting, magic numbers, commented code |
| `lint` | Unused imports/vars, unreachable code, shadowed declarations |
| `security` | Hardcoded secrets, SQL injection, XSS, eval(), exposed data |
| `logic` | Off-by-one, unhandled promises, null checks, mutation bugs |
| `tests` | Missing tests, empty assertions, happy-path-only coverage |
| `performance` | N+1 queries, missing memoisation, sync I/O |
| `types` | TypeScript `any`, missing return types, unsafe casts |

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | *(required)* | Your Anthropic API key |
| `GITHUB_TOKEN` | Auto-set by Actions | GitHub token for posting comments |
| `REVIEWER_MODEL` | `claude-haiku-4-5-20251001` | Override the model |
| `REVIEWER_SKILLS` | all skills | Comma-separated skill list |
| `REVIEWER_FAIL_ON_ERROR` | `true` | Fail CI on errors |
