#!/bin/bash

# Variables
FILE_TO_COMMIT=$1 # File to commit (passed as an argument)
TARGET_FOLDER=$2  # Target folder in the repository (passed as an argument)
COMMIT_MESSAGE="Auto-commit for $FILE_TO_COMMIT: $(date)"
REPO_URL="https://github.com/ITEC490-Capstone-Group3/FunFirstPlay.git"
BASE_BRANCH="main" # Base branch for the pull request
TEMP_BRANCH="update-$(date +%Y%m%d%H%M%S)" # Temporary branch name

# Check if file and target folder are provided
if [ -z "$FILE_TO_COMMIT" ] || [ -z "$TARGET_FOLDER" ]; then
    echo "Usage: ./auto-pr-existing-branch.sh <file-path> <target-folder>"
    exit 1
fi

# Navigate to the project directory
cd "/Users/zenos/Documents/Spring 2025 Semester (KU)/ITEC490 - Capstone/ITEC490-Capstone Project"

# Ensure the directory is a Git repository
if [ ! -d ".git" ]; then
    echo "Error: Not a Git repository. Please initialize the repository with 'git init'."
    exit 1
fi

# Ensure the file exists
if [ ! -f "$FILE_TO_COMMIT" ]; then
    echo "Error: File '$FILE_TO_COMMIT' does not exist."
    exit 1
fi

# Ensure GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed. Install it with 'brew install gh'."
    exit 1
fi

# Stage all untracked files
git add .

# Commit the changes
git commit -m "$COMMIT_MESSAGE"

# Create a temporary branch and push changes
git checkout -b "$TEMP_BRANCH"
git push origin "$TEMP_BRANCH"

# Create a pull request using GitHub CLI
gh pr create --repo "ITEC490-Capstone-Group3/FunFirstPlay" --base "$BASE_BRANCH" --head "$TEMP_BRANCH" --title "$COMMIT_MESSAGE" --body "This pull request updates the file: $FILE_TO_COMMIT in the folder: $TARGET_FOLDER."

# Switch back to the base branch
git checkout "$BASE_BRANCH"