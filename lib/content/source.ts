import type {
  Category, Locale, LocalizedRoute, Page, PageKey, Paginated, PracticeArea, PracticeAreaSummary,
  Post, PostSummary, SiteSettings, TeamMember, TeamMemberSummary, Translations,
} from './types'
import { LOCALES } from './types'
import { localizePath } from './routes'
import { POSTS_PER_PAGE } from './utils'
import type { LocalizedPageName } from '../../i18n/routes'

/**
 * The only way pages read content. Implemented by every adapter in
 * lib/content/adapters/ and selected with the CONTENT_SOURCE env var.
 */
export interface ContentSource {
  getSiteSettings(locale: Locale): Promise<SiteSettings>
  getPage(key: PageKey, locale: Locale): Promise<Page | null>
  listPracticeAreas(locale: Locale): Promise<PracticeAreaSummary[]>
  getPracticeArea(slug: string, locale: Locale): Promise<PracticeArea | null>
  listTeamMembers(locale: Locale): Promise<TeamMemberSummary[]>
  getTeamMember(slug: string, locale: Locale): Promise<TeamMember | null>
  listCategories(locale: Locale): Promise<Category[]>
  listPosts(locale: Locale, opts?: { page?: number, category?: string, perPage?: number }): Promise<Paginated<PostSummary>>
  getPost(slug: string, locale: Locale): Promise<Post | null>
  /** Every prerenderable route in every locale (prerender + sitemap). */
  listRoutes(): Promise<LocalizedRoute[]>
}

export const CONTENT_SOURCES = ['local', 'sanity'] as const
export type ContentSourceName = (typeof CONTENT_SOURCES)[number]

export function resolveContentSourceName(value: string | undefined): ContentSourceName {
  const name = (value || 'local').toLowerCase()
  if (!(CONTENT_SOURCES as readonly string[]).includes(name)) {
    throw new Error(`Unknown CONTENT_SOURCE "${value}". Expected one of: ${CONTENT_SOURCES.join(', ')}`)
  }
  return name as ContentSourceName
}

/** Static routes and the page key that feeds each of them. */
const STATIC_ROUTES: Array<{ name: LocalizedPageName, page?: PageKey }> = [
  { name: 'index', page: 'home' },
  { name: 'about', page: 'about' },
  { name: 'practice-areas' },
  { name: 'team' },
  { name: 'blog' },
  { name: 'contact', page: 'contact' },
  { name: 'search', page: 'search' },
  { name: 'privacy', page: 'privacy' },
  { name: 'terms', page: 'terms' },
  { name: '404' },
]

/**
 * Shared implementation of `listRoutes()` built on the other methods, so every
 * adapter produces the same route set. Adapters may override it if their API
 * can do it in fewer requests.
 */
export async function collectRoutes(source: Omit<ContentSource, 'listRoutes'>): Promise<LocalizedRoute[]> {
  const routes: LocalizedRoute[] = []

  const add = (name: LocalizedPageName, locale: Locale, params: Record<string, string>, translations: Translations | 'all', lastmod?: string) => {
    const alternates: LocalizedRoute['alternates'] = {}
    for (const l of LOCALES) {
      if (translations === 'all') alternates[l] = localizePath(name, l, params)
      else if (translations[l]) {
        const key = Object.keys(params)[0]
        alternates[l] = localizePath(name, l, key ? { ...params, [key]: translations[l]! } : params)
      }
    }
    routes.push({ name, locale, params, path: localizePath(name, locale, params), alternates, ...(lastmod ? { lastmod } : {}) })
  }

  for (const locale of LOCALES) {
    for (const r of STATIC_ROUTES) {
      const page = r.page ? await source.getPage(r.page, locale) : null
      add(r.name, locale, {}, 'all', page?.updatedAt)
    }

    for (const area of await source.listPracticeAreas(locale)) {
      add('practice-areas-slug', locale, { slug: area.slug }, area.translations)
    }
    for (const member of await source.listTeamMembers(locale)) {
      add('team-slug', locale, { slug: member.slug }, member.translations)
    }

    const all = await source.listPosts(locale, { perPage: Number.MAX_SAFE_INTEGER })
    for (const post of all.items) {
      add('blog-slug', locale, { slug: post.slug }, post.translations, post.publishedAt)
    }
    const { pageCount } = await source.listPosts(locale, { perPage: POSTS_PER_PAGE })
    for (let page = 2; page <= pageCount; page++) {
      add('blog-page-page', locale, { page: String(page) }, 'all')
    }

    for (const category of await source.listCategories(locale)) {
      add('blog-category-category', locale, { category: category.slug }, category.translations)
      const { pageCount: catPages } = await source.listPosts(locale, { category: category.slug, perPage: POSTS_PER_PAGE })
      for (let page = 2; page <= catPages; page++) {
        // Page counts can differ between locales, so no alternates for deep pages.
        add('blog-category-category-page-page', locale, { category: category.slug, page: String(page) }, { [locale]: category.slug })
      }
    }
  }
  return routes
}
