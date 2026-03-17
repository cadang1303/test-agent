# ai-pr-reviewer

AI-powered pull request code reviewer using **GitHub Models** — completely free. Drop into any project in one command. No API keys, no billing — uses the `GITHUB_TOKEN` already in every Actions run.

---

## Quick start

Run this from the root of any project you want to add the reviewer to:

```bash
bash /path/to/ai-pr-reviewer/setup.sh
```

Then commit and push:

```bash
git add .ai-reviewer .github/workflows/ai-review.yml ai-reviewer.config.js
git commit -m "chore: add AI PR reviewer"
git push
```

The reviewer will automatically run on every new PR commit. No secrets to configure.

---

## How it works (project structure after setup)

```
your-project/
├── .ai-reviewer/               ← reviewer source (committed to your repo)
│   ├── package.json
│   └── src/
│       ├── cli.js
│       ├── index.js
│       └── utils/
├── .github/workflows/
│   └── ai-review.yml           ← triggers on every PR commit
└── ai-reviewer.config.js       ← optional per-project config
```

The workflow installs dependencies and runs `node src/cli.js` directly from `.ai-reviewer/` — no external packages or published npm modules needed.

---

## Available free models

| Model | Set in config |
|---|---|
| GPT-4o mini *(default)* | `"gpt-4o-mini"` |
| GPT-4o | `"gpt-4o"` |
| Llama 3.3 70B | `"Meta-Llama-3.3-70B-Instruct"` |
| DeepSeek R1 | `"DeepSeek-R1"` |
| Phi-4 mini | `"Phi-4-mini-instruct"` |

Browse all at [github.com/marketplace/models](https://github.com/marketplace/models).

---

## Per-project config

Edit `ai-reviewer.config.js` in your project root:

```js
export default {
  model: "gpt-4o-mini",            // free default
  skills: ["security", "logic"],   // subset of skills
  failOnError: true,               // fail CI on errors
  ignorePatterns: ["dist/", "*.min.js"],
};
```

---

## Test locally

```bash
# Get a token at github.com/settings/tokens (no special scopes needed)
GITHUB_TOKEN=ghp_... node .ai-reviewer/src/test-local.js
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

## Workflow env overrides

| Variable | Default | Description |
|---|---|---|
| `GITHUB_TOKEN` | Auto-set by Actions | GitHub Models + PR comments |
| `REVIEWER_MODEL` | `gpt-4o-mini` | Override the model |
| `REVIEWER_SKILLS` | all | Comma-separated skill list |
| `REVIEWER_FAIL_ON_ERROR` | `true` | Fail CI on errors |
