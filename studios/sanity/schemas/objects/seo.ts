import { defineField, defineType } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  description: 'Optional. Title and description default to the content above.',
  fields: [
    defineField({ name: 'title', type: 'string', validation: rule => rule.max(70).warning('Search engines cut titles around 60–70 characters.') }),
    defineField({ name: 'description', type: 'text', rows: 3, validation: rule => rule.max(170).warning('Keep it under about 160 characters.') }),
    defineField({ name: 'image', title: 'Social image', type: 'altImage', description: 'Shown when the page is shared. Cropped to 1200×630.' }),
    defineField({ name: 'noindex', title: 'Hide from search engines', type: 'boolean', initialValue: false }),
  ],
})
