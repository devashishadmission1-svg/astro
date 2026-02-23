#!/bin/bash

# Configuration
REMOTE="origin"
BRANCH="main"

# Get current date and time for default commit message
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
COMMIT_MSG=${1:-"Update: $TIMESTAMP"}

echo "🚀 Starting automated push to GitHub..."

# Add all changes
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "⚠️  No changes detected to commit."
else
    # Commit changes
    git commit -m "$COMMIT_MSG"
    
    # Push to GitHub
    echo "📤 Pushing to $REMOTE/$BRANCH..."
    git push $REMOTE $BRANCH
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed changes to GitHub!"
    else
        echo "❌ Error: Failed to push changes."
        exit 1
    fi
fi
