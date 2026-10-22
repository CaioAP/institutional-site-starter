import { defineField, type ReferenceFilterResolver, type SlugValidationContext } from 'sanity'

/** Set by the translation plugin; editors switch language from the toolbar. */
export const languageField = defineField({
  name: 'language',
  type: 'string',
  readOnly: true,
  hidden: true,
})

/** Slugs only need to be unique among documents of the same type and language. */
async function isUniqueInLanguage(slug: string, context: SlugValidationContext) {
  const { document, getClient } = context
  const id = document?._id.replace(/^drafts\./, '')
  return getClient({ apiVersion: '2025-02-19' }).fetch<boolean>(
    `!defined(*[_type == $type && slug.current == $slug && language == $language && !(_id in [$draft, $published])][0]._id)`,
    { type: document?._type, slug, language: document?.language ?? null, draft: `drafts.${id}`, published: id },
  )
}

export const slugField = (source: string) => defineField({
  name: 'slug',
  title: 'Slug (URL)',
  type: 'slug',
  description: 'Part of the page address. Changing it breaks existing links.',
  options: { source, isUnique: isUniqueInLanguage },
  validation: rule => rule.required(),
})

/** Reference filter: only documents in the same language as the one being edited. */
const filterSameLanguage: ReferenceFilterResolver = ({ document }) => ({
  filter: 'language == $language',
  params: { language: document.language },
})
export const sameLanguage = { filter: filterSameLanguage }

export const orderField = defineField({
  name: 'order',
  title: 'Order',
  type: 'number',
  description: 'Lower numbers come first.',
  initialValue: 10,
  validation: rule => rule.required().integer(),
})
