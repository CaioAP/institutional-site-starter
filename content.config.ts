import { defineCollection, defineContentConfig, z } from '@nuxt/content'

/**
 * Local content (the "local" ContentSource). Files live under
 * content/<locale>/<collection>/; the locale is the first path segment and the
 * file name is the slug. `translationKey` links the same entity across locales
 * and is also used for references (author, category, team, areas).
 *
 * Schemas enforce required alt text on every image.
 */

const image = z.object({
  src: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})

const seo = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: image.optional(),
  noindex: z.boolean().optional(),
}).optional()

const link = z.object({ label: z.string(), href: z.string() })

const section = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('hero'),
    heading: z.string(),
    text: z.string().optional(),
    image,
    video: z.object({ src: z.string(), type: z.string() }).optional(),
    cta: link.optional(),
  }),
  /** Renders the markdown body of the page file at this position */
  z.object({ type: z.literal('body'), heading: z.string().optional() }),
  z.object({
    type: z.literal('highlights'),
    heading: z.string().optional(),
    items: z.array(z.object({ title: z.string(), text: z.string(), icon: z.string().optional() })),
  }),
  z.object({ type: z.literal('cta'), heading: z.string(), text: z.string().optional(), link }),
  z.object({ type: z.literal('practiceAreas'), heading: z.string(), text: z.string().optional() }),
  z.object({ type: z.literal('team'), heading: z.string(), text: z.string().optional() }),
  z.object({ type: z.literal('latestPosts'), heading: z.string(), limit: z.number().default(3) }),
  z.object({ type: z.literal('location'), heading: z.string(), text: z.string().optional() }),
])

export default defineContentConfig({
  collections: {
    settings: defineCollection({
      type: 'data',
      source: '*/settings.yml',
      schema: z.object({
        firmName: z.string(),
        tagline: z.string(),
        contact: z.object({ email: z.string(), phone: z.string(), whatsapp: z.string() }),
        address: z.object({
          street: z.string(), city: z.string(), region: z.string(),
          postalCode: z.string(), country: z.string(), mapUrl: z.string(),
        }),
        officeHours: z.string(),
        socials: z.array(z.object({
          label: z.string(), url: z.string(),
          icon: z.enum(['linkedin', 'instagram', 'facebook', 'youtube', 'x']),
        })),
        seo,
      }),
    }),

    pages: defineCollection({
      type: 'page',
      source: '*/pages/*.md',
      schema: z.object({
        key: z.enum(['home', 'about', 'contact', 'search', 'privacy', 'terms']),
        lead: z.string().optional(),
        sections: z.array(section).default([{ type: 'body' }]),
        seo,
        updatedAt: z.string().optional(),
      }),
    }),

    practiceAreas: defineCollection({
      type: 'page',
      source: '*/practice-areas/*.md',
      schema: z.object({
        translationKey: z.string(),
        summary: z.string(),
        icon: z.string(),
        order: z.number(),
        team: z.array(z.string()).default([]),
        seo,
      }),
    }),

    team: defineCollection({
      type: 'page',
      source: '*/team/*.md',
      schema: z.object({
        translationKey: z.string(),
        name: z.string(),
        role: z.string(),
        registration: z.string().optional(),
        photo: image,
        shortBio: z.string(),
        areas: z.array(z.string()).default([]),
        email: z.string().optional(),
        linkedin: z.string().optional(),
        order: z.number(),
        seo,
      }),
    }),

    categories: defineCollection({
      type: 'data',
      source: '*/categories/*.yml',
      schema: z.object({
        translationKey: z.string(),
        title: z.string(),
      }),
    }),

    posts: defineCollection({
      type: 'page',
      source: '*/blog/*.md',
      schema: z.object({
        translationKey: z.string(),
        description: z.string(),
        cover: image,
        category: z.string(),
        tags: z.array(z.string()).default([]),
        author: z.string(),
        publishedAt: z.string(),
        updatedAt: z.string().optional(),
        seo,
      }),
    }),
  },
})
