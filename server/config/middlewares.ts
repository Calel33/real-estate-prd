import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  // Suppress client-disconnect socket errors (ECONNABORTED, ECONNRESET, EPIPE)
  // that are normal during video streaming. Must be first so it overrides
  // ctx.onerror before any other middleware starts streaming responses.
  'global::handle-socket-errors',
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
