import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Page sections, in the order editors arrange them. The `_type` names map to
 * PageSection types in lib/content/adapters/sanity.ts (SANITY_SECTION_TYPES).
 * Practice areas, team, latest posts and location pull their content from the
 * other documents; editors only set the heading.
 */
const heading = defineField({ name: 'heading', type: 'string', validation: rule => rule.required() })
const optionalHeading = defineField({ name: 'heading', type: 'string' })
const text = defineField({ name: 'text', type: 'text', rows: 3 })

export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  fields: [
    heading,
    text,
    defineField({ name: 'image', type: 'altImage', description: 'Also the poster and the reduced-motion fallback of the video.', validation: rule => rule.required() }),
    defineField({
      name: 'video',
      title: 'Background video (optional)',
      type: 'file',
      description: 'Short, muted, looping MP4 or WebM. Keep it small (under ~3 MB).',
      options: { accept: 'video/mp4,video/webm' },
    }),
    defineField({ name: 'cta', title: 'Button', type: 'siteLink' }),
  ],
  preview: { select: { title: 'heading', media: 'image' }, prepare: ({ title, media }) => ({ title, subtitle: 'Hero', media }) },
})

export const textSection = defineType({
  name: 'textSection',
  title: 'Text',
  type: 'object',
  fields: [optionalHeading, defineField({ name: 'body', type: 'richText' })],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Text', subtitle: 'Text' }) },
})

export const highlights = defineType({
  name: 'highlights',
  title: 'Highlights',
  type: 'object',
  fields: [
    optionalHeading,
    defineField({
      name: 'items',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        name: 'highlight',
        fields: [
          defineField({ name: 'title', type: 'string', validation: rule => rule.required() }),
          defineField({ name: 'text', type: 'text', rows: 2, validation: rule => rule.required() }),
          defineField({ name: 'icon', type: 'string', description: 'Icon name from app/components/ui/Icon.vue, e.g. "scale".' }),
        ],
      })],
    }),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Highlights', subtitle: 'Highlights' }) },
})

export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'Call to action',
  type: 'object',
  fields: [heading, text, defineField({ name: 'link', type: 'siteLink', validation: rule => rule.required() })],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title, subtitle: 'Call to action' }) },
})

const listing = (name: string, title: string, extra: ReturnType<typeof defineField>[] = []) => defineType({
  name,
  title,
  type: 'object',
  fields: [heading, ...extra],
  preview: { select: { title: 'heading' }, prepare: ({ title: h }) => ({ title: h, subtitle: title }) },
})

export const practiceAreasSection = listing('practiceAreasSection', 'Practice areas', [text])
export const teamSection = listing('teamSection', 'Team', [text])
export const latestPostsSection = listing('latestPostsSection', 'Latest posts', [
  defineField({ name: 'limit', title: 'Number of posts', type: 'number', initialValue: 3, validation: rule => rule.min(1).max(12).integer() }),
])
export const locationSection = listing('locationSection', 'Location and contact', [text])

export const sectionTypes = [hero, textSection, highlights, ctaSection, practiceAreasSection, teamSection, latestPostsSection, locationSection]
