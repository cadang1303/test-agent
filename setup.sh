#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup.sh — install ai-pr-reviewer into any project
#
# Usage (run this from inside your target project root):
#   curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/ai-pr-reviewer/main/setup.sh | bash
#
# Or if you have the package locally:
#   bash /path/to/ai-pr-reviewer/setup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

REVIEWER_DIR=".ai-reviewer"
WORKFLOW_DIR=".github/workflows"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "🤖  ai-pr-reviewer setup"
echo "────────────────────────"

# 1. Copy reviewer source into .ai-reviewer/
echo "📁  Copying reviewer into $REVIEWER_DIR/ ..."
mkdir -p "$REVIEWER_DIR"
cp -r "$SCRIPT_DIR/src"           "$REVIEWER_DIR/"
cp    "$SCRIPT_DIR/package.json"  "$REVIEWER_DIR/"

# 2. Create .gitignore inside .ai-reviewer so node_modules isn't committed
cat > "$REVIEWER_DIR/.gitignore" << 'GITIGNORE'
node_modules/
GITIGNORE

# 3. Copy the workflow file
echo "⚙️   Adding GitHub Actions workflow to $WORKFLOW_DIR/ ..."
mkdir -p "$WORKFLOW_DIR"
cp "$SCRIPT_DIR/templates/ai-review.yml" "$WORKFLOW_DIR/ai-review.yml"

# 4. Copy example config if none exists
if [ ! -f "ai-reviewer.config.js" ]; then
  cp "$SCRIPT_DIR/ai-reviewer.config.js" "ai-reviewer.config.js"
  echo "📋  Created ai-reviewer.config.js (edit to customise)"
else
  echo "📋  ai-reviewer.config.js already exists — skipping"
fi

echo ""
echo "✅  Done! Files added to your project:"
echo ""
echo "   $REVIEWER_DIR/          ← reviewer source (commit this)"
echo "   $WORKFLOW_DIR/ai-review.yml  ← GitHub Actions workflow"
echo "   ai-reviewer.config.js   ← optional config"
echo ""
echo "📌  Next steps:"
echo "   1. git add .ai-reviewer .github/workflows/ai-review.yml ai-reviewer.config.js"
echo "   2. git commit -m 'chore: add AI PR reviewer'"
echo "   3. git push — the reviewer will run on your next PR automatically"
echo ""
echo "   No secrets to configure — uses the GITHUB_TOKEN already in every Actions run."
echo ""
