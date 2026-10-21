import { CogIcon } from '@sanity/icons/Cog'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { languageField } from '../objects/fields'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'contact', title: 'Contact' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    languageField,
    defineField({ name: 'firmName', title: 'Firm name', type: 'string', group: 'general', validation: rule => rule.required() }),
    defineField({ name: 'tagline', type: 'string', group: 'general', validation: rule => rule.required() }),
    defineField({
      name: 'contact',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({ name: 'email', type: 'string', validation: rule => rule.required().email() }),
        defineField({ name: 'phone', type: 'string', validation: rule => rule.required() }),
        defineField({
          name: 'whatsapp',
          title: 'WhatsApp number',
          type: 'string',
          description: 'Digits only, with country code (e.g. 5511900000000). Leave empty to hide the button.',
          validation: rule => rule.regex(/^\d*$/, { name: 'digits' }),
        }),
      ],
    }),
    defineField({
      name: 'address',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({ name: 'street', type: 'string', validation: rule => rule.required() }),
        defineField({ name: 'city', type: 'string', validation: rule => rule.required() }),
        defineField({ name: 'region', title: 'State / region', type: 'string', validation: rule => rule.required() }),
        defineField({ name: 'postalCode', title: 'Postal code', type: 'string', validation: rule => rule.required() }),
        defineField({ name: 'country', title: 'Country code', type: 'string', initialValue: 'BR', validation: rule => rule.required().length(2) }),
        defineField({ name: 'mapUrl', title: 'Map link', type: 'url', validation: rule => rule.required() }),
      ],
    }),
    defineField({ name: 'officeHours', title: 'Office hours', type: 'string', group: 'contact', validation: rule => rule.required() }),
    defineField({
      name: 'socials',
      title: 'Social links',
      type: 'array',
      group: 'contact',
      of: [defineArrayMember({
        type: 'object',
        name: 'social',
        fields: [
          defineField({ name: 'label', type: 'string', validation: rule => rule.required() }),
          defineField({ name: 'url', type: 'url', validation: rule => rule.required() }),
          defineField({
            name: 'icon',
            type: 'string',
            options: { list: ['linkedin', 'instagram', 'facebook', 'youtube', 'x'] },
            validation: rule => rule.required(),
          }),
        ],
      })],
    }),
    defineField({ name: 'seo', title: 'Default SEO', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'firmName', language: 'language' },
    prepare: ({ title, language }) => ({ title: title || 'Site settings', subtitle: language }),
  },
})
