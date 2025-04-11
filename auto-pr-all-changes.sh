#!/bin/bash

# Variables
COMMIT_MESSAGE="Auto-commit for all modified files: $(date)"
REPO_URL="https://github.com/ITEC490-Capstone-Group3/FunFirstPlay.git"
BASE_BRANCH="Akmal-Test" # Base branch for the pull request
TEMP_BRANCH="update-$(date +%Y%m%d%H%M%S)" # Temporary branch name

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

# Check if there are any changes to commit
if [ -z "$(git status --porcelain)" ]; then
    echo "No changes to commit. Exiting."
    exit 0
fi

# Stage all changes (modified, added, or deleted files)
git add .

# Commit the changes
git commit -m "$COMMIT_MESSAGE"

# Create a temporary branch and push changes
git checkout -b "$TEMP_BRANCH"
git push origin "$TEMP_BRANCH"

# Create a pull request using GitHub CLI
gh pr create --repo "$REPO_URL" --base "$BASE_BRANCH" --head "$TEMP_BRANCH" --title "$COMMIT_MESSAGE" --body "This pull request includes all modified files in the project directory."

# Switch back to the base branch
git checkout "$BASE_BRANCH"