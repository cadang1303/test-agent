/**
 * test-local.js
 *
 * Run the reviewer locally against a fake diff to test your config
 * and API key before deploying to GitHub Actions.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node src/test-local.js
 */

import { reviewFiles } from "./index.js";

const MOCK_FILES = [
  {
    filename: "src/auth.js",
    patch: `@@ -0,0 +1,40 @@
+const express = require('express')
+const router = express.Router()
+const db = require('../db')
+
+// TODO: remove before prod
+const ADMIN_PASSWORD = 'hunter2'
+const SECRET_KEY = 'abc123secret'
+
+router.post('/login', async (req, res) => {
+  const username = req.body.username
+  const password = req.body.password
+
+  // Direct string concat - not parameterised
+  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
+  const user = await db.query(query)
+
+  if (user) {
+    res.json({ token: 'logged_in', user: user })
+  }
+})
+
+router.get('/users', async (req, res) => {
+  const users = await db.query('SELECT * FROM users')
+  console.log('All users:', JSON.stringify(users))  // logs sensitive data
+  res.json(users)
+})
+
+function validateEmail(e) {
+  // never called anywhere
+  return e.includes('@')
+}
+
+module.exports = router`,
  },
  {
    filename: "src/utils/math.js",
    patch: `@@ -0,0 +1,20 @@
+export function average(numbers) {
+  let sum = 0
+  for (let i = 0; i <= numbers.length; i++) {
+    sum += numbers[i]
+  }
+  return sum / numbers.length
+}
+
+export function divide(a, b) {
+  return a / b
+}
+
+export function fetchPrices(ids) {
+  const prices = []
+  for (const id of ids) {
+    const price = fetch('/api/price/' + id)  // N+1 calls, no await, no error handling
+    prices.push(price)
+  }
+  return prices
+}`,
  },
  {
    filename: "package-lock.json",
    patch: `@@ -1,5 +1,5 @@
-  "version": "1.0.0"
+  "version": "1.0.1"`,
  },
];

console.log("🤖  ai-pr-reviewer — local test run");
console.log(`📋  Model: claude-haiku-4-5-20251001 (default for testing)\n`);

const results = await reviewFiles(MOCK_FILES, {
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: "claude-haiku-4-5-20251001",
  skills: ["convention", "lint", "security", "logic", "performance"],
  failOnError: false,
});

// Pretty-print results
for (const { filename, comments } of results) {
  if (comments.length === 0) continue;
  console.log(`\n── ${filename} ──`);
  for (const c of comments) {
    const icon = { error: "🔴", warning: "🟡", info: "🔵" }[c.severity] ?? "⚪";
    console.log(`  ${icon} [${c.skill}] line ${c.line}: ${c.body}`);
  }
}

const totals = results.flatMap((r) => r.comments);
console.log(
  `\n✅  Done — ${totals.length} comment(s) across ${results.length} file(s)`
);
