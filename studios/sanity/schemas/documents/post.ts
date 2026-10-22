import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { defineField, defineType } from 'sanity'
import { languageField, sameLanguage, slugField } from '../objects/fields'

export const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'details', title: 'Details' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    languageField,
    defineField({ name: 'title', type: 'string', group: 'content', validation: rule => rule.required() }),
    slugField('title'),
    defineField({ name: 'excerpt', type: 'text', rows: 3, group: 'content', description: 'Shown on listings and as the search description.', validation: rule => rule.required().max(200) }),
    defineField({ name: 'cover', title: 'Cover image', type: 'altImage', group: 'content', validation: rule => rule.required() }),
    defineField({ name: 'body', type: 'richText', group: 'content', description: 'Use the + button to add images and YouTube/Vimeo videos.' }),
    defineField({ name: 'category', type: 'reference', to: [{ type: 'category' }], options: sameLanguage, group: 'details', validation: rule => rule.required() }),
    defineField({ name: 'author', type: 'reference', to: [{ type: 'teamMember' }], options: sameLanguage, group: 'details', validation: rule => rule.required() }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' }, group: 'details' }),
    defineField({ name: 'publishedAt', title: 'Published on', type: 'date', group: 'details', initialValue: () => new Date().toISOString().slice(0, 10), validation: rule => rule.required() }),
    defineField({ name: 'updatedAt', title: 'Updated on', type: 'date', group: 'details' }),
    defineField({ name: 'seo', type: 'seo', group: 'seo' }),
  ],
  orderings: [{ title: 'Newest first', name: 'publishedDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'publishedAt', media: 'cover' } },
})
