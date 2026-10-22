import type { StructureResolver } from 'sanity/structure'
import { LANGUAGES } from './schemas/languages'

/** Content grouped by language, so editors work in one language at a time. */
const byLanguage = (S: Parameters<StructureResolver>[0], type: string, title: string, order?: { field: string, direction: 'asc' | 'desc' }) =>
  S.listItem()
    .title(title)
    .schemaType(type)
    .child(
      S.list()
        .title(title)
        .items(LANGUAGES.map(lang =>
          S.listItem()
            .title(lang.title)
            .schemaType(type)
            .child(
              S.documentTypeList(type)
                .title(`${title} (${lang.title})`)
                .filter('_type == $type && language == $language')
                .params({ type, language: lang.id })
                .defaultOrdering(order ? [order] : [])
                .initialValueTemplates([S.initialValueTemplateItem(`${type}-${lang.id}`)]),
            ),
        )),
    )

export const structure: StructureResolver = S =>
  S.list()
    .title('Content')
    .items([
      byLanguage(S, 'post', 'Blog posts', { field: 'publishedAt', direction: 'desc' }),
      byLanguage(S, 'category', 'Blog categories'),
      byLanguage(S, 'practiceArea', 'Practice areas', { field: 'order', direction: 'asc' }),
      byLanguage(S, 'teamMember', 'Team', { field: 'order', direction: 'asc' }),
      byLanguage(S, 'page', 'Pages'),
      S.divider(),
      byLanguage(S, 'siteSettings', 'Site settings'),
    ])
