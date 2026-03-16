#!/usr/bin/env bash

set -euo pipefail

# Required:
#   SFTP_HOST        e.g. ftp.example.com
#   SFTP_USER        e.g. deploy
#   SFTP_PASSWORD    e.g. superSecret
# Optional:
#   SFTP_PORT        default: 5539
#   REMOTE_BASE_DIR  remote directory where "cd" is executed first
#   LOCAL_ASSETS_DIR default: ../cinea/public/assets
#   LOCAL_WELCOME_DIR default: ../cinea/resources/views/welcome.blade.php
#   REMOTE_ASSETS_PARENT default: public
#   REMOTE_WELCOME_PARENT default: resources/views
#   FORCE_CLEAN_REMOTE default: 0 (set 1 to clean remote assets/welcome first)
SFTP_HOST="${SFTP_HOST:-168.197.50.151}"
SFTP_USER="${SFTP_USER:-root}"
SFTP_PASSWORD="${SFTP_PASSWORD:-Nuva_2025_RR12}"

REMOTE_BASE_DIR="${REMOTE_BASE_DIR:-/var/www/cinea}"
SFTP_PORT="${SFTP_PORT:-5539}"
FORCE_CLEAN_REMOTE="${FORCE_CLEAN_REMOTE:-1}"

LOCAL_ASSETS_DIR="${LOCAL_ASSETS_DIR:-../cinea/public/assets}"
LOCAL_WELCOME_DIR="${LOCAL_WELCOME_DIR:-../cinea/resources/views/welcome.blade.php}"
REMOTE_ASSETS_PARENT="${REMOTE_ASSETS_PARENT:-./public}"
REMOTE_WELCOME_PARENT="${REMOTE_WELCOME_PARENT:-resources/views}"

if [[ ! -d "$LOCAL_ASSETS_DIR" ]]; then
  echo "Local folder not found: $LOCAL_ASSETS_DIR" >&2
  exit 1
fi

if [[ ! -f "$LOCAL_WELCOME_DIR" ]]; then
  echo "Local file not found: $LOCAL_WELCOME_DIR" >&2
  exit 1
fi

if [[ "$SFTP_PASSWORD" == "CHANGE_ME" ]]; then
  echo "Set SFTP_PASSWORD in deploy-sftp.sh or export SFTP_PASSWORD before running." >&2
  exit 1
fi

echo "Deploying via SFTP to ${SFTP_USER}@${SFTP_HOST}:${REMOTE_BASE_DIR}"
echo "Uploading:"
echo "  - $LOCAL_ASSETS_DIR  -> $REMOTE_ASSETS_PARENT/"
echo "  - $LOCAL_WELCOME_DIR -> $REMOTE_WELCOME_PARENT/"

if ! command -v sshpass >/dev/null 2>&1; then
  echo "Missing dependency: sshpass" >&2
  echo "Install it and run again." >&2
  exit 1
fi

SFTP_BATCH_FILE="$(mktemp)"
trap 'rm -f "$SFTP_BATCH_FILE"' EXIT

{
  echo "cd $REMOTE_BASE_DIR"

  echo "-rm $REMOTE_WELCOME_PARENT/welcome.blade.php"
  if [[ "$FORCE_CLEAN_REMOTE" == "1" ]]; then
    # OpenSSH sftp does not support rm -R; clear files then recreate dir if needed.
    echo "-rm $REMOTE_ASSETS_PARENT/assets/*"
    echo "-rmdir $REMOTE_ASSETS_PARENT/assets"
  fi
  echo "-mkdir $REMOTE_ASSETS_PARENT/assets"
  printf 'put -r %s/* %s/assets/\n' "$LOCAL_ASSETS_DIR" "$REMOTE_ASSETS_PARENT"
  echo "put $LOCAL_WELCOME_DIR $REMOTE_WELCOME_PARENT/welcome.blade.php"
  echo "bye"
} > "$SFTP_BATCH_FILE"

sshpass -p "$SFTP_PASSWORD" sftp \
  -oBatchMode=no \
  -oPreferredAuthentications=password,keyboard-interactive \
  -oPubkeyAuthentication=no \
  -oStrictHostKeyChecking=no \
  -oUserKnownHostsFile=/dev/null \
  -P "$SFTP_PORT" \
  -b "$SFTP_BATCH_FILE" \
  "${SFTP_USER}@${SFTP_HOST}"

echo "Deploy completed."
