import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'map-field': {
    enabled: true,
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
