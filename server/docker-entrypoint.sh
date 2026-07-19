#!/bin/sh
set -e

mkdir -p /opt/app/.tmp /opt/app/public/uploads
chown -R node:node /opt/app/.tmp /opt/app/public /opt/app/public/uploads

# Auto-import data if export file exists (one-time)
if [ -f /opt/app/public/uploads/export_20260719013251.tar.gz ]; then
  echo ">>> Importing data from export file..."
  cd /opt/app && npx strapi import -f /opt/app/public/uploads/export_20260719013251.tar.gz
  rm /opt/app/public/uploads/export_20260719013251.tar.gz
  chown -R node:node /opt/app/.tmp /opt/app/public /opt/app/public/uploads
  echo ">>> Import complete"
fi

exec gosu node npm run start
