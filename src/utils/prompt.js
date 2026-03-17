/**
 * Builds the review prompt, selecting relevant skill instructions
 * based on the file extension and the enabled skill list.
 */

const SKILL_PROMPTS = {
  convention: `**SKILL: convention** — Code style and naming
- Naming: camelCase for JS/TS vars, PascalCase for classes/components, snake_case for Python
- Flag single-letter variables outside loops
- Detect inconsistent indentation or mixed tabs/spaces
- Spot magic numbers that should be named constants
- Flag commented-out code blocks left in`,

  lint: `**SKILL: lint** — Static analysis issues
- Unused imports, variables, or parameters
- Unreachable code after return/throw
- Missing semicolons (JS/TS, if project uses them consistently)
- Declared but never-called functions
- Shadowed variable declarations (var/let conflicts)
- Imports that could be replaced with built-ins`,

  security: `**SKILL: security** — Vulnerabilities and secrets
- Hardcoded secrets, API keys, tokens, passwords, connection strings
- SQL injection risk (string concatenation in queries)
- XSS risk (dangerouslySetInnerHTML, direct innerHTML writes)
- Use of eval(), Function(), unsafe deserialization
- Exposed sensitive data in logs or error messages
- CORS set to wildcard (*) unnecessarily
- Prototype pollution risks`,

  logic: `**SKILL: logic** — Bugs and edge cases
- Off-by-one errors (< vs <=, array index bounds)
- Unhandled promise rejections (missing .catch or try/catch in async)
- Missing null/undefined checks before property access
- Functions that can return undefined unexpectedly
- Mutation of function arguments or shared state
- Floating-point comparison (=== instead of Math.abs delta)
- Infinite loop risk (loop condition never changes)`,

  tests: `**SKILL: tests** — Test coverage and quality
- New public functions missing tests
- Tests with no assertions (empty test bodies)
- Tests that only test the happy path and miss error cases
- Hardcoded test data that should be parameterised
- Mocks that do not assert call count or arguments`,

  performance: `**SKILL: performance** — Efficiency concerns
- N+1 query patterns (loops with DB/API calls)
- Missing memoisation on expensive recomputations
- Large objects copied unnecessarily in hot paths
- Synchronous I/O in a Node.js event handler
- Missing pagination on list endpoints`,

  types: `**SKILL: types** — TypeScript/type safety
- 'any' usage that could be typed properly
- Missing return type annotations on exported functions
- Non-null assertions (!) hiding real null risks
- Type casts (as X) that bypass type safety
- Enums used as bitmasks (prefer union types)`,
};

// Map file extensions to language hints and relevant skills
const EXT_LANGUAGE_MAP = {
  ".js": "JavaScript",
  ".jsx": "JavaScript (React)",
  ".ts": "TypeScript",
  ".tsx": "TypeScript (React)",
  ".py": "Python",
  ".go": "Go",
  ".java": "Java",
  ".rb": "Ruby",
  ".rs": "Rust",
  ".php": "PHP",
  ".cs": "C#",
  ".cpp": "C++",
  ".c": "C",
};

export function buildReviewPrompt(filename, patch, enabledSkills) {
  const ext = "." + filename.split(".").pop().toLowerCase();
  const language = EXT_LANGUAGE_MAP[ext] ?? "unknown language";

  const skillInstructions = enabledSkills
    .filter((s) => SKILL_PROMPTS[s])
    .map((s) => SKILL_PROMPTS[s])
    .join("\n\n");

  return `Review this ${language} diff from file \`${filename}\`.

Apply only the skills below. Skip anything not covered by them.

${skillInstructions}

Return ONLY valid JSON in this exact shape — no markdown, no preamble:
{
  "comments": [
    {
      "line": <integer — the + line number in the diff where the issue appears>,
      "skill": "<skill name>",
      "severity": "error" | "warning" | "info",
      "body": "<clear, actionable description of the issue and how to fix it>"
    }
  ],
  "summary": "<1-2 sentence overall assessment>",
  "score": <integer 0-100, where 100 is perfect>
}

If there are no issues, return: { "comments": [], "summary": "No issues found.", "score": 100 }

Diff:
\`\`\`diff
${patch}
\`\`\``;
}
