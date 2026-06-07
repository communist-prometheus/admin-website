#!/usr/bin/env bash
# Push every secret line from services/comms-worker/.secrets.local to
# the prod comms-worker via `wrangler secret put`. Skips empty values.
# CLOUDFLARE_* are runtime creds for this script (not worker secrets).
#
# Usage:
#   1. Fill services/comms-worker/.secrets.local with real values.
#   2. bash scripts/comms-secrets-push.sh
#
# Idempotent: re-running overwrites existing secret values.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VARS_FILE="$ROOT/services/comms-worker/.secrets.local"
CONFIG="$ROOT/services/comms-worker/wrangler.jsonc"

if [[ ! -f "$VARS_FILE" ]]; then
  echo "missing $VARS_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$VARS_FILE"
set +a

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" || -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set in $VARS_FILE" >&2
  exit 1
fi

export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID

SECRETS=(
  RESEND_API_KEY
  RESEND_WEBHOOK_SECRET
  UNSUBSCRIBE_SECRET
  CF_ACCESS_AUD
  CF_ACCESS_TEAM
)

for name in "${SECRETS[@]}"; do
  value="${!name:-}"
  if [[ -z "$value" ]]; then
    echo "skip $name (empty)"
    continue
  fi
  echo "push $name"
  printf '%s' "$value" \
    | npx wrangler --config "$CONFIG" secret put "$name"
done

echo "done."
