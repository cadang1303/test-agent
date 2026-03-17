# ai-pr-reviewer

AI-powered pull request code reviewer using **Anthropic Claude**. Drop into any project with one setup command — reviews every PR commit automatically.

---

## Quick start

### 1. Add your Anthropic API key as a secret

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

```
Name:  ANTHROPIC_API_KEY
Value: sk-ant-...
```

Get your key at [console.anthropic.com](https://console.anthropic.com).

### 2. Run the setup script

From inside your project root:

```bash
bash /path/to/ai-pr-reviewer/setup.sh
```

### 3. Commit and push

```bash
git add .ai-reviewer .github/workflows/ai-review.yml ai-reviewer.config.js
git commit -m "chore: add AI PR reviewer"
git push
```

The reviewer runs automatically on every new PR commit.

---

## Project structure after setup

```
your-project/
├── .ai-reviewer/                    ← reviewer source (committed to your repo)
│   ├── package.json
│   └── src/
│       ├── cli.js
│       ├── index.js
│       ├── test-local.js
│       └── utils/
├── .github/workflows/
│   └── ai-review.yml                ← triggers on every PR commit
└── ai-reviewer.config.js            ← optional per-project config
```

---

## Models

| Model | Speed | Cost | Best for |
|---|---|---|---|
| `claude-haiku-4-5-20251001` | ⚡ Fastest | 💚 Cheapest | Testing, high-volume repos |
| `claude-sonnet-4-6` | ⚖️ Balanced | 💛 Moderate | Production (recommended) |
| `claude-opus-4-6` | 🧠 Thorough | 🔴 Premium | Critical / security-sensitive repos |

---

## Per-project config

Edit `ai-reviewer.config.js` in your project root:

```js
export default {
  model: "claude-haiku-4-5-20251001",  // swap to claude-sonnet-4-6 for production
  skills: ["convention", "lint", "security", "logic", "tests"],
  failOnError: true,
  ignorePatterns: ["dist/", "*.min.js", "migrations/"],
};
```

---

## Test locally

```bash
ANTHROPIC_API_KEY=sk-ant-... node .ai-reviewer/src/test-local.js
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

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Yes | Your Anthropic API key |
| `GITHUB_TOKEN` | Auto-set | Used for posting PR comments |
| `REVIEWER_MODEL` | Optional | Override the model |
| `REVIEWER_SKILLS` | Optional | Comma-separated skill list |
| `REVIEWER_FAIL_ON_ERROR` | Optional | Set `"false"` to warn without blocking merge |
