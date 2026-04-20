#!/bin/bash

# Simple secret scanner for pre-commit hook
# Checks for common accidental leaks in staged files

echo "🔍 Scanning for secrets..."

# List of patterns to search for (regex)
# API Keys, AWS secrets, Private Keys, etc.
PATTERNS=(
  "AIza[0-9A-Za-z-_]{35}"                     # Google API Key
  "sk_live_[0-9a-zA-Z]{24}"                   # Stripe live secret key
  "xox[baprs]-[0-9a-zA-Z]{10,48}"             # Slack token
  "-----BEGIN RSA PRIVATE KEY-----"           # RSA Private Key
  "-----BEGIN OPENSSH PRIVATE KEY-----"       # OpenSSH Private Key
  "\"[A-Za-z0-9+/]{40}\""                      # AWS Secret Access Key (approx)
  "sqp_[a-z0-9]{40}"                          # SonarQube token
  "ghp_[a-zA-Z0-9]{36}"                       # GitHub PAT
)

STAGED_FILES=$(git diff --cached --name-only)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

FOUND=0

for pattern in "${PATTERNS[@]}"; do
  # Use grep to search in staged files
  # Exclude .env files and this script
  RESULTS=$(grep -EHin "$pattern" $STAGED_FILES 2>/dev/null | grep -v ".env" | grep -v "scripts/check-secrets.sh")
  
  if [ ! -z "$RESULTS" ]; then
    echo "❌ POTENTIAL SECRET LEAK DETECTED:"
    echo "$RESULTS"
    FOUND=1
  fi
done

if [ $FOUND -eq 1 ]; then
  echo "⚠️  COMMIT ABORTED. Please remove secrets or use environment variables."
  exit 1
fi

echo "✅ No obvious secrets found."
exit 0
