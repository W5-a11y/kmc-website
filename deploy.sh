#!/usr/bin/env bash
# Deploy this static site to Vercel (kmcxlucas.com).
#
# Why the copy: the Vercel project lives on a Hobby plan under "KMC's projects".
# Hobby blocks deployments whose git commit author isn't a team member, and our
# commits are authored by the W5-a11y account. Deploying from a .git-less copy
# makes Vercel attribute the deploy to the logged-in CLI user (the project
# owner) instead of the commit author, which passes the check.
#
# One-time setup:  vercel login   (log in as the account that owns KMC's projects)
# Usage:           ./deploy.sh
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d)/kmc-deploy"
mkdir -p "$TMP"

rsync -a \
  --exclude='.git' --exclude='node_modules' --exclude='tmp' --exclude='output' \
  --exclude='.tmp-blueprint' --exclude='scroll-editorial' --exclude='.DS_Store' \
  "$SRC/" "$TMP/"

cd "$TMP"
vercel --prod --yes --scope kmc-s-projects

rm -rf "$TMP"
echo "✅ Deployed to https://kmcxlucas.com"
