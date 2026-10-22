import type { SanityDocumentLike } from 'sanity'
import { localizePath } from '../../lib/content/routes'
import type { LocalizedPageName } from '../../i18n/routes'
import type { Locale, PageKey } from '../../lib/content/types'

/** Site route that renders each page key (same table as lib/content/source.ts). */
const PAGE_ROUTES: Record<PageKey, LocalizedPageName> = {
  home: 'index', about: 'about', contact: 'contact', search: 'search', privacy: 'privacy', terms: 'terms',
}
const DETAIL_ROUTES: Record<string, LocalizedPageName> = {
  post: 'blog-slug', practiceArea: 'practice-areas-slug', teamMember: 'team-slug', category: 'blog-category-category',
}

/**
 * Path of a document on the site, or undefined when it has none yet (no slug)
 * or none at all (site settings).
 */
export function sitePath(doc: SanityDocumentLike): string | undefined {
  const locale = doc.language as Locale | undefined
  if (!locale) return undefined
  if (doc._type === 'page') {
    const route = PAGE_ROUTES[doc.key as PageKey]
    return route ? localizePath(route, locale) : undefined
  }
  const route = DETAIL_ROUTES[doc._type]
  const slug = (doc.slug as { current?: string } | undefined)?.current
  if (!route || !slug) return undefined
  return localizePath(route, locale, route === 'blog-category-category' ? { category: slug } : { slug })
}
