#!/usr/bin/env bash
# One-shot: make app-role "editor and above" carry write access to the
# repos editors need — so editors' own OAuth token is enough and nobody
# needs per-user grants or a service token.
#
# What it does (idempotent — safe to re-run):
#   1. Creates the `editors` and `chief-editors` org teams if missing
#      (the app's RBAC, src/sw/rbac/team-slugs.ts, expects these slugs;
#       they don't exist yet — only `admins` does — which is also why
#       assigning those roles in Settings -> Members currently 404s).
#   2. Grants both teams WRITE (push) on:  tickets  +  public-website-content.
#   Org admins already have admin on every repo, so the `admins` team /
#   owners need nothing.
#
# RUN (you, once, authenticated as an org admin):
#   gh auth switch --user undeadliner    # an account with org-admin rights
#   bash scripts/setup-editor-access.sh
#
# Add people to the teams afterwards via the admin UI (Settings -> Members,
# which works once the teams exist) or:
#   gh api -X PUT orgs/communist-prometheus/teams/editors/memberships/<login>
set -euo pipefail

ORG="communist-prometheus"
TEAMS=(editors chief-editors)
REPOS=(tickets public-website-content)

ensure_team() {
  local slug="$1"
  if gh api "orgs/$ORG/teams/$slug" >/dev/null 2>&1; then
    echo "  team '$slug' already exists"
  else
    gh api -X POST "orgs/$ORG/teams" -f name="$slug" -f privacy=closed \
      -f description="App role: ${slug%s} and above" >/dev/null
    echo "  created team '$slug'"
  fi
}

grant_repo() {
  local slug="$1" repo="$2"
  gh api -X PUT "orgs/$ORG/teams/$slug/repos/$ORG/$repo" \
    -f permission=push >/dev/null
  echo "  granted '$slug' WRITE on '$repo'"
}

echo "Acting as: $(gh api user -q .login 2>/dev/null || echo '??? (run: gh auth login)')"
echo

for slug in "${TEAMS[@]}"; do
  ensure_team "$slug"
  for repo in "${REPOS[@]}"; do
    grant_repo "$slug" "$repo"
  done
done

echo
echo "Done. Editor+ now have write via teams — their OAuth token is enough;"
echo "ticket attachments work, and Settings -> Members role assignment no"
echo "longer 404s. Add members to the teams to grant them the role."
