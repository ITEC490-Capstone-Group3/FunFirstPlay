#!/bin/bash

# Variables
REPO_URL="https://github.com/ITEC490-Capstone-Group3/FunFirstPlay.git"
BASE_BRANCH="Akmal-Test" # Base branch for the pull request
TEMP_BRANCH="update-$(date +%Y%m%d%H%M%S)" # Temporary branch name
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

# Stash uncommitted changes to avoid conflicts
git stash -u

# Create a temporary branch for the pull request
git checkout -b "$TEMP_BRANCH"

# Apply the stashed changes to the temporary branch
git stash pop

# Stage all changes (modified, added, or deleted files)
git add .

# Push the temporary branch to the remote repository
git push origin "$TEMP_BRANCH"

# Create a pull request using GitHub CLI
gh pr create --repo "$REPO_URL" --base "$BASE_BRANCH" --head "$TEMP_BRANCH" --title "$PR_TITLE" --body "$PR_BODY"

# Switch back to the base branch
git checkout "$BASE_BRANCH"