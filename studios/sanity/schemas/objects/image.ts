import { defineField, defineType } from 'sanity'

/** Image with required alt text (empty only for purely decorative images). */
export const altImage = defineType({
  name: 'altImage',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describe the image for people who cannot see it.',
      validation: rule => rule.required(),
    }),
  ],
})
