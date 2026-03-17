/**
 * ai-pr-reviewer — core module
 * Can be imported as a library or run via CLI / GitHub Actions.
 */

// import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { buildReviewPrompt } from "./utils/prompt.js";
import { parseReview } from "./utils/parser.js";
import { chunkPatch } from "./utils/chunker.js";
import { loadConfig } from "./utils/config.js";

export async function reviewFiles(files, options = {}) {
  const config = options.apiKey ? options : await loadConfig(options);
  // const client = new Anthropic({ apiKey: config.apiKey });
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: "https://models.github.ai/inference",
  });

  const allResults = [];

  for (const file of files) {
    if (!file.patch) continue;
    if (shouldSkipFile(file.filename, config.ignorePatterns)) continue;

    console.log(`  Reviewing: ${file.filename}`);

    // Split large diffs into chunks to stay within token limits
    const chunks = chunkPatch(file.patch, config.maxTokensPerChunk);
    const fileComments = [];

    for (const chunk of chunks) {
      const prompt = buildReviewPrompt(file.filename, chunk, config.skills);

      const response = await client.messages.create({
        model: config.model,
        max_tokens: 1024,
        system: getSystemPrompt(config),
        messages: [{ role: "user", content: prompt }],
      });

      const parsed = parseReview(response.content[0].text, file.filename);
      fileComments.push(...parsed.comments);
    }

    allResults.push({ filename: file.filename, comments: fileComments });
  }

  return allResults;
}

function shouldSkipFile(filename, ignorePatterns) {
  return ignorePatterns.some((pattern) => {
    if (pattern instanceof RegExp) return pattern.test(filename);
    return filename.includes(pattern);
  });
}

function getSystemPrompt(config) {
  return `You are an expert code reviewer embedded in a CI pipeline.
Your job is to review pull request diffs and return structured JSON feedback.
Be concise, actionable, and specific. Focus on real issues, not nitpicks.
Severity levels: "error" (must fix, blocks merge), "warning" (should fix), "info" (suggestion).
Always respond with valid JSON only — no preamble, no markdown fences.`;
}
