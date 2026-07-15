#!/bin/sh
set -e

mkdir -p /opt/app/.tmp /opt/app/public/uploads
chown -R node:node /opt/app/.tmp /opt/app/public /opt/app/public/uploads

exec gosu node npm run start
