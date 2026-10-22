import { DocumentIcon } from '@sanity/icons/Document'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { languageField } from '../objects/fields'
import { sectionTypes } from '../objects/sections'

/** Editorial pages. Their addresses are fixed by the site (i18n/routes.ts), so they have a key instead of a slug. */
export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    languageField,
    defineField({
      name: 'key',
      title: 'Which page',
      type: 'string',
      options: {
        list: [
          { title: 'Home', value: 'home' },
          { title: 'About', value: 'about' },
          { title: 'Contact', value: 'contact' },
          { title: 'Search', value: 'search' },
          { title: 'Privacy policy', value: 'privacy' },
          { title: 'Terms of use', value: 'terms' },
        ],
      },
      validation: rule => rule.required(),
    }),
    defineField({ name: 'title', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'lead', title: 'Intro', type: 'text', rows: 3 }),
    defineField({
      name: 'sections',
      type: 'array',
      of: sectionTypes.map(s => defineArrayMember({ type: s.name })),
    }),
    defineField({ name: 'updatedAt', title: 'Last reviewed', type: 'date', description: 'Optional. Shown on legal pages and in the sitemap.' }),
    defineField({ name: 'seo', type: 'seo' }),
  ],
  preview: {
    select: { title: 'title', key: 'key', language: 'language' },
    prepare: ({ title, key, language }) => ({ title, subtitle: `${key} · ${language}` }),
  },
})
