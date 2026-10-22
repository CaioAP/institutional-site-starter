import { TagIcon } from '@sanity/icons/Tag'
import { defineField, defineType } from 'sanity'
import { languageField, slugField } from '../objects/fields'

export const category = defineType({
  name: 'category',
  title: 'Blog category',
  type: 'document',
  icon: TagIcon,
  fields: [
    languageField,
    defineField({ name: 'title', type: 'string', validation: rule => rule.required() }),
    slugField('title'),
  ],
  preview: { select: { title: 'title', subtitle: 'language' } },
})
