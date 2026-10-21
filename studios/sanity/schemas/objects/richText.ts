import { defineArrayMember, defineField, defineType } from 'sanity'
import { parseVideoUrl } from '../../../../lib/content/rich-text/video'

/**
 * Rich text allowed in posts, practice areas, bios and text sections. Mirrors
 * what lib/content/rich-text/portable-text.ts converts: anything else would not
 * render on the site, so it is not offered here.
 */
export const videoEmbed = defineType({
  name: 'videoEmbed',
  title: 'Video (YouTube or Vimeo)',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Video link',
      type: 'url',
      description: 'Paste the YouTube or Vimeo address. The video only loads when the visitor clicks play.',
      validation: rule => rule.required().custom(v => (!v || parseVideoUrl(v) ? true : 'Use a YouTube or Vimeo link')),
    }),
    defineField({ name: 'title', type: 'string', description: 'Describes the video for screen readers.', validation: rule => rule.required() }),
    defineField({ name: 'caption', type: 'string' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'url' },
  },
})

export const richText = defineType({
  name: 'richText',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Heading 4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullets', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Code', value: 'code' },
          { title: 'Subscript', value: 'sub' },
          { title: 'Superscript', value: 'sup' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'Address',
                type: 'url',
                validation: rule => rule.required().uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alternative text', type: 'string', validation: rule => rule.required() }),
        defineField({ name: 'caption', type: 'string' }),
      ],
    }),
    defineArrayMember({ type: 'videoEmbed' }),
  ],
})
