FROM node:22-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm ci
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN echo "BUILD_COMMIT=f9283af" && echo "=== config/env/production/admin.ts ===" && cat config/env/production/admin.ts && echo "=== end ==="

ENV NODE_ENV=production
RUN npm run build

FROM node:22-slim
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends gosu \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/
COPY --from=build /opt/package.json /opt/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY --from=build /opt/app ./
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p .tmp public/uploads \
    && chown -R node:node /opt/app

EXPOSE 1337

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:1337/_health').then(r => process.exit(r.status === 204 ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
