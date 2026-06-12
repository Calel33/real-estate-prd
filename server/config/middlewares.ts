const config: any[] = [
  // Suppress client-disconnect socket errors (ECONNABORTED, ECONNRESET, EPIPE)
  // that are normal during video streaming. Must be first so it overrides
  // ctx.onerror before any other middleware starts streaming responses.
  'global::handle-socket-errors',
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', 'api.mapbox.com'],
          'connect-src': ["'self'", 'https://api.mapbox.com', 'https://events.mapbox.com'],
          'worker-src': ['blob:'],
          'script-src': ["'self'", 'api.mapbox.com'],
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
