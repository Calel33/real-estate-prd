const config = ({ env }: { env: any }): Record<string, any> => ({
  'map-field': {
    enabled: true,
  },
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
  email: {
    config: {
      provider: 'strapi-provider-email-resend',
      providerOptions: {
        apiKey: env('RESEND_API_KEY'),
      },
      settings: {
        defaultFrom: env('RESEND_FROM_EMAIL'),
        defaultReplyTo: env('RESEND_FROM_EMAIL'),
      },
    },
  },
});

export default config;
