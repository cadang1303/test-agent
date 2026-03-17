#!/usr/bin/env node
/**
 * CLI entry point. Reads environment variables set by GitHub Actions,
 * fetches the PR diff, runs the review, then posts comments back.
 */

import { Octokit } from "@octokit/rest";
import { reviewFiles } from "./index.js";
import { loadConfig } from "./utils/config.js";
import { buildSummary } from "./utils/summary.js";

async function main() {
  const config = loadConfig();

  // ── Validate required env vars ──────────────────────────────────────────
  const required = ["GITHUB_TOKEN", "ANTHROPIC_API_KEY", "GITHUB_REPOSITORY"];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`❌  Missing required env var: ${key}`);
      process.exit(1);
    }
  }

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  const pullNumber = parseInt(
    process.env.PR_NUMBER || process.env.GITHUB_REF?.match(/\/(\d+)\//)?.[1]
  );

  if (!pullNumber) {
    console.error("❌  Could not determine PR number. Set PR_NUMBER env var.");
    process.exit(1);
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // ── Fetch changed files from GitHub ────────────────────────────────────
  console.log(`\n🔍  Fetching diff for PR #${pullNumber} in ${owner}/${repo}`);
  const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });

  console.log(`📄  Found ${files.length} changed files\n`);

  // ── Run AI review ───────────────────────────────────────────────────────
  const results = await reviewFiles(files, config);

  // ── Post inline comments ────────────────────────────────────────────────
  const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: pullNumber });
  const commitSha = pr.head.sha;
  let totalErrors = 0;
  let totalWarnings = 0;
  const allComments = [];

  for (const { filename, comments } of results) {
    for (const comment of comments) {
      if (comment.severity === "error") totalErrors++;
      if (comment.severity === "warning") totalWarnings++;

      const emoji = { error: "🔴", warning: "🟡", info: "🔵" }[comment.severity] ?? "⚪";

      try {
        await octokit.pulls.createReviewComment({
          owner,
          repo,
          pull_number: pullNumber,
          body: `${emoji} **[${comment.skill.toUpperCase()}]** ${comment.body}`,
          path: filename,
          line: comment.line,
          commit_id: commitSha,
        });
        allComments.push({ filename, ...comment });
      } catch {
        // Line may not exist in diff — skip silently
      }
    }
  }

  // ── Post summary comment ────────────────────────────────────────────────
  const summary = buildSummary(results, totalErrors, totalWarnings, config);
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: pullNumber,
    body: summary,
  });

  console.log(`\n✅  Review complete`);
  console.log(`   🔴 Errors:   ${totalErrors}`);
  console.log(`   🟡 Warnings: ${totalWarnings}`);
  console.log(`   💬 Comments: ${allComments.length}`);

  // ── Fail CI if errors found and failOnError is enabled ─────────────────
  if (config.failOnError && totalErrors > 0) {
    console.log(`\n❌  Failing CI: ${totalErrors} error(s) found`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
