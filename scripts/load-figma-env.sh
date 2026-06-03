#!/usr/bin/env bash
# Source Figma API env from .env.local (repo root).
set -a
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$ROOT/.env.local" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT/.env.local"
elif [[ -f "$ROOT/.env" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT/.env"
fi
set +a
