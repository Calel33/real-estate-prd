import type { Core } from '@strapi/types';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.customFields.register({
      name: 'map-field',
      plugin: 'map-field',
      type: 'json',
    });

    // Document Service middleware: fires on property publish/unpublish/delete
    // to trigger Next.js cache revalidation via webhook.
    strapi.documents.use(async (context, next) => {
      const relevantTypes = ['api::property.property'];

      // Pre-capture slug for delete actions — Strapi v5's delete result may
      // not include the slug field, so we look it up before the document is
      // removed via findOne({ documentId }).
      // Falls back to result?.slug if the pre-lookup fails.
      let preCapturedSlug: string | undefined;
      if (
        relevantTypes.includes(context.uid) &&
        context.action === 'delete'
      ) {
        try {
          const params = context.params as { documentId?: string } | undefined;
          if (params?.documentId) {
            const doc = await strapi
              .documents('api::property.property')
              .findOne({ documentId: params.documentId });
            preCapturedSlug = (doc as { slug?: string } | null)?.slug;
          }
        } catch {
          // Pre-lookup failed — will fall back to result?.slug below
        }
      }

      const result = await next();

      if (!relevantTypes.includes(context.uid)) return result;

      if (['publish', 'unpublish', 'delete'].includes(context.action)) {
        setImmediate(async () => {
          try {
            const url = process.env.NEXTJS_REVALIDATE_URL;
            const secret = process.env.REVALIDATION_SECRET;

            if (!url || !secret) {
              strapi.log.warn(
                'Revalidation webhook skipped: NEXTJS_REVALIDATE_URL and REVALIDATION_SECRET must be set.'
              );
              return;
            }

            // For delete, use pre-captured slug (document exists before next()).
            // For publish/unpublish, use the result slug (document returned after next()).
            const slug =
              context.action === 'delete'
                ? preCapturedSlug ?? (result as { slug?: string } | undefined)?.slug
                : (result as { slug?: string } | undefined)?.slug;
            const path = slug ? `/properties/${slug}` : '/properties';

            await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${secret}`,
              },
              body: JSON.stringify({
                path,
                tags: ['properties', 'global'],
              }),
            });

            strapi.log.info(`Revalidation webhook fired for ${path}`);
          } catch (error) {
            strapi.log.error('Revalidation webhook failed:', error);
          }
        });
      }

      return result;
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    // Only seed in development
    if (process.env.NODE_ENV !== 'development') return;

    // Check if already seeded
    const existingProperties = await strapi.documents('api::property.property').findMany({});
    if (existingProperties.length > 0) {
      console.log('Seed data already exists, skipping...');
      return;
    }

    console.log('Seeding initial data...');

    try {
      await seedProperty(strapi);
      await seedSubmission(strapi);
      await seedGlobal(strapi);
      // Also set public permissions
      await setPublicPermissions(strapi);
      console.log('Seed complete!');
    } catch (error) {
      console.error('Seed failed:', error);
    }
  },
};

async function setPublicPermissions(strapi: any) {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) return;

  const permissions = [
    'api::property.property.find',
    'api::property.property.findOne',
    'api::global.global.find',
    'api::global.global.findOne',
    'api::about.about.find',
    'api::about.about.findOne',
  ];

  for (const action of permissions) {
    const existing = await strapi.query('plugin::users-permissions.permission').findOne({
      where: { action, role: publicRole.id },
    });

    if (!existing) {
      await strapi.query('plugin::users-permissions.permission').create({
        data: { action, role: publicRole.id },
      });
    }
  }

  console.log('Public permissions set for property, global, and about.');
}

async function seedProperty(strapi: any) {
  // Upload hero image
  let heroImageId: number | null = null;
  try {
    const fs = require('fs');
    const path = require('path');
    const mime = require('mime-types');
    const filePath = path.join(__dirname, '..', 'data', 'uploads', 'beautiful-picture.jpg');

    if (fs.existsSync(filePath)) {
      const fileName = 'beautiful-picture.jpg';
      const ext = fileName.split('.').pop();
      const mimeType = mime.lookup(ext || '') || 'image/jpeg';

      // Check if file already uploaded
      const existingFile = await strapi.query('plugin::upload.file').findOne({
        where: { name: 'beautiful-picture' },
      });

      if (existingFile) {
        heroImageId = existingFile.id;
      } else {
        const [uploaded] = await strapi.plugin('upload').service('upload').upload({
          files: {
            filepath: filePath,
            originalFileName: fileName,
            size: fs.statSync(filePath).size,
            mimetype: mimeType,
          },
          data: {
            fileInfo: {
              alternativeText: 'Sunset Valley Ranch hero image',
              caption: 'hero-property',
              name: 'hero-property',
            },
          },
        });
        heroImageId = uploaded.id;
      }
    }
  } catch (err) {
    console.warn('Could not upload hero image for seed property:', err);
  }

  const property = await strapi.documents('api::property.property').create({
    data: {
      title: 'Sunset Valley Ranch',
      slug: 'sunset-valley-ranch',
      location: 'Austin, Texas',
      acreage: 12.5,
      propertyType: 'ranch',
      description: {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'A stunning ranch property with panoramic views of the Texas hill country. This 12.5-acre estate features rolling pastures, mature oak trees, and a spring-fed pond. Perfect for a family compound, equestrian facility, or weekend retreat.',
          },
        ],
      },
      heroImage: heroImageId,
      status: 'published',
      publishedAt: new Date(),
    },
  });

  // In Strapi v5, must explicitly publish for it to appear in public API
  await strapi.documents('api::property.property').publish({
    documentId: property.documentId,
  });

  console.log('Seed property created: Sunset Valley Ranch');
}

async function seedSubmission(strapi: any) {
  await strapi.documents('api::submission.submission').create({
    data: {
      name: 'Test Visitor',
      email: 'test@example.com',
      message: 'This is a test submission for development purposes.',
      submittedAt: new Date().toISOString(),
    },
  });

  console.log('Seed submission created.');
}

async function seedGlobal(strapi: any) {
  const global = await strapi.documents('api::global.global').findFirst({});

  if (global) {
    await strapi.documents('api::global.global').update({
      documentId: global.documentId,
      data: {
        footerText: '2026 Sunset Valley Properties. All rights reserved.',
        contactEmail: 'hello@sunsetvalley.com',
        contactPhone: '+1 (512) 555-0142',
        socialLinks: [
          {
            platform: 'instagram',
            url: 'https://instagram.com/sunsetvalley',
            label: 'Instagram',
          },
          {
            platform: 'facebook',
            url: 'https://facebook.com/sunsetvalley',
            label: 'Facebook',
          },
        ],
      },
    });

    console.log('Global settings updated with real estate content.');
  }
}
