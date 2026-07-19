#!/bin/sh
set -e

mkdir -p /opt/app/.tmp /opt/app/public/uploads
chown -R node:node /opt/app/.tmp

# Auto-import data if export file exists (one-time)
if [ -f /opt/app/public/export_20260719013251.tar.gz ]; then
  echo ">>> Importing data from export file..."
  cp /opt/app/public/export_20260719013251.tar.gz /tmp/export.tar.gz
  rm -f /opt/app/public/export_20260719013251.tar.gz
  cd /opt/app && npx strapi import -f /tmp/export.tar.gz --force
  rm -f /tmp/export.tar.gz
  chown -R node:node /opt/app/public/uploads
  echo ">>> Import complete"
fi

exec gosu node npm run start
