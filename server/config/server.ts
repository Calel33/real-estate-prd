const config = ({ env }: { env: any }): Record<string, any> => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  transfer: {
    remote: {
      enabled: env.bool('TRANSFER_REMOTE_ENABLED', false),
    },
  },
});

export default config;
