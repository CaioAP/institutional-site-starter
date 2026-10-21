import { defineField, defineType } from 'sanity'

export const siteLink = defineType({
  name: 'siteLink',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'string', validation: rule => rule.required() }),
    defineField({
      name: 'href',
      title: 'Address',
      type: 'string',
      description: 'A site path like /contato or /en/contact, or a full URL.',
      validation: rule => rule.required().custom(v => (!v || /^(\/(?!\/)|https?:|mailto:|tel:)/.test(v) ? true : 'Use a path starting with / or a full http(s), mailto: or tel: URL')),
    }),
  ],
})
