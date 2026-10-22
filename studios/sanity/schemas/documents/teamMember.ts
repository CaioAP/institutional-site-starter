import { UserIcon } from '@sanity/icons/User'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { languageField, orderField, sameLanguage, slugField } from '../objects/fields'

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team member',
  type: 'document',
  icon: UserIcon,
  fields: [
    languageField,
    defineField({ name: 'name', type: 'string', validation: rule => rule.required() }),
    slugField('name'),
    defineField({ name: 'role', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'registration', title: 'Bar registration', type: 'string', description: 'Optional, e.g. "OAB/SP 000.000".' }),
    defineField({ name: 'photo', type: 'altImage', validation: rule => rule.required() }),
    defineField({ name: 'shortBio', title: 'Short bio', type: 'text', rows: 3, validation: rule => rule.required().max(240) }),
    defineField({ name: 'bio', title: 'Full bio', type: 'richText' }),
    defineField({
      name: 'areas',
      title: 'Practice areas',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'practiceArea' }], options: sameLanguage })],
    }),
    defineField({ name: 'email', type: 'string', validation: rule => rule.email() }),
    defineField({ name: 'linkedin', title: 'LinkedIn', type: 'url' }),
    orderField,
    defineField({ name: 'seo', type: 'seo' }),
  ],
  orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
})
