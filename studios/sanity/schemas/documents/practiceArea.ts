import { CaseIcon } from '@sanity/icons/Case'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { languageField, orderField, sameLanguage, slugField } from '../objects/fields'

export const practiceArea = defineType({
  name: 'practiceArea',
  title: 'Practice area',
  type: 'document',
  icon: CaseIcon,
  fields: [
    languageField,
    defineField({ name: 'title', type: 'string', validation: rule => rule.required() }),
    slugField('title'),
    defineField({ name: 'summary', type: 'text', rows: 2, validation: rule => rule.required().max(200) }),
    defineField({ name: 'icon', type: 'string', description: 'Icon name from app/components/ui/Icon.vue, e.g. "briefcase".', validation: rule => rule.required() }),
    orderField,
    defineField({ name: 'body', type: 'richText' }),
    defineField({
      name: 'team',
      title: 'Team members',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'teamMember' }], options: sameLanguage })],
    }),
    defineField({ name: 'seo', type: 'seo' }),
  ],
  orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'language' } },
})
