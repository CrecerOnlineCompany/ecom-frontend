#!/usr/bin/env bash
set -euo pipefail

: "${SFTP_HOST:?SFTP_HOST is required}"
: "${SFTP_USER:?SFTP_USER is required}"
: "${SFTP_PASSWORD:?SFTP_PASSWORD is required}"

SFTP_PORT="${SFTP_PORT:-22}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/html}"
LOCAL_DIR="${LOCAL_DIR:-dist}"

if [[ ! -d "$LOCAL_DIR" ]]; then
  echo "Build directory not found: $LOCAL_DIR" >&2
  echo "Run npm run build before deploying." >&2
  exit 1
fi

if ! command -v sshpass >/dev/null 2>&1; then
  echo "Missing dependency: sshpass" >&2
  exit 1
fi

BATCH_FILE="$(mktemp)"
trap 'rm -f "$BATCH_FILE"' EXIT

{
  echo "cd $REMOTE_DIR"
  echo "put -r $LOCAL_DIR/* ."
  echo "bye"
} > "$BATCH_FILE"

sshpass -p "$SFTP_PASSWORD" sftp \
  -oBatchMode=no \
  -oPreferredAuthentications=password,keyboard-interactive \
  -oPubkeyAuthentication=no \
  -oStrictHostKeyChecking=no \
  -oUserKnownHostsFile=/dev/null \
  -P "$SFTP_PORT" \
  -b "$BATCH_FILE" \
  "${SFTP_USER}@${SFTP_HOST}"

echo "Deploy completed to ${SFTP_USER}@${SFTP_HOST}:${REMOTE_DIR}"
