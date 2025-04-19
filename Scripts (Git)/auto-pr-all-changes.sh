#!/bin/bash

# Variables
REPO_URL="https://github.com/ITEC490-Capstone-Group3/FunFirstPlay.git"
BASE_BRANCH="main" # Base branch for the pull request
WORKING_BRANCH="Akmal-Testing" # Branch where changes will be committed
PR_TITLE="Pull request for all modified files: $(date)"
PR_BODY="This pull request includes all modified files in the project directory."

# Navigate to the project directory
cd "/Users/zenos/Documents/Spring 2025 Semester (KU)/ITEC490 - Capstone/ITEC490-Capstone Project"

# Ensure the directory is a Git repository
if [ ! -d ".git" ]; then
    echo "Error: Not a Git repository. Please initialize the repository with 'git init'."
    exit 1
fi

# Ensure GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed. Install it with 'brew install gh'."
    exit 1
fi

# Check if there are any changes to include in the pull request
if [ -z "$(git status --porcelain)" ]; then
    echo "No changes to include in the pull request. Exiting."
    exit 0
fi

# Ensure the working branch exists or create it
if git show-ref --verify --quiet "refs/heads/$WORKING_BRANCH"; then
    # Switch to the working branch if it exists
    git checkout "$WORKING_BRANCH"
else
    # Create and switch to the working branch if it doesn't exist
    git checkout -b "$WORKING_BRANCH"
fi

# Stage all changes (modified, added, or deleted files)
git add .

# Commit the changes
git commit -m "Auto-commit for all modified files: $(date)"

# Push the working branch to the remote repository
git push origin "$WORKING_BRANCH"

# Create a pull request using GitHub CLI
gh pr create --repo "$REPO_URL" --base "$BASE_BRANCH" --head "$WORKING_BRANCH" --title "$PR_TITLE" --body "$PR_BODY"

# Switch back to the base branch
git checkout "$BASE_BRANCH"