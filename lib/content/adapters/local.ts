/**
 * Local adapter: content lives as Markdown/YAML in content/<locale>/... and is
 * read through Nuxt Content. The adapter itself is framework-free: it receives
 * a `LocalStore` (in the app, a thin wrapper around `queryCollection`; in tests,
 * in-memory fixtures) and maps raw documents into the domain models.
 *
 * Cross-references (author, category, team, areas) use `translationKey`,
 * which is the same in every locale.
 */
import type { ContentSource } from '../source'
import { collectRoutes } from '../source'
import type {
  Category, Image, Locale, PageKey, PageSection, PracticeAreaSummary, PostSummary, Seo, SiteSettings,
  SocialLink, TeamMemberSummary, Translations,
} from '../types'
import { LOCALES } from '../types'
import { minimarkToRichText, type MinimarkTree } from '../rich-text/minimark'
import { byOrder, byPublishedDesc, paginate, readingTime } from '../utils'

// ---------------------------------------------------------------------------
// Raw document shapes (what content.config.ts produces)
// ---------------------------------------------------------------------------

interface BaseDoc {
  /** e.g. "en/blog/succession-planning" */
  stem: string
}
interface LocalSeo {
  title?: string
  description?: string
  image?: Image
  noindex?: boolean
}

export interface LocalSettingsDoc extends BaseDoc {
  firmName: string
  tagline: string
  contact: SiteSettings['contact']
  address: SiteSettings['address']
  officeHours: string
  socials: SocialLink[]
  seo?: LocalSeo
}

/** Same as PageSection, plus `body`, which renders the markdown body in place. */
export type LocalSection
  = | Exclude<PageSection, { type: 'text' | 'latestPosts' }>
    | { type: 'latestPosts', heading: string, limit?: number }
    | { type: 'body', heading?: string }

export interface LocalPageDoc extends BaseDoc {
  key: PageKey
  title: string
  lead?: string
  sections?: LocalSection[]
  seo?: LocalSeo
  updatedAt?: string
  body?: MinimarkTree
}

export interface LocalPracticeAreaDoc extends BaseDoc {
  translationKey: string
  title: string
  summary: string
  icon: string
  order: number
  team?: string[]
  seo?: LocalSeo
  body?: MinimarkTree
}

export interface LocalTeamDoc extends BaseDoc {
  translationKey: string
  name: string
  role: string
  registration?: string
  photo: Image
  shortBio: string
  areas?: string[]
  email?: string
  linkedin?: string
  order: number
  seo?: LocalSeo
  body?: MinimarkTree
}

export interface LocalCategoryDoc extends BaseDoc {
  translationKey: string
  title: string
}

export interface LocalPostDoc extends BaseDoc {
  translationKey: string
  title: string
  description: string
  cover: Image
  category: string
  tags?: string[]
  author: string
  publishedAt: string
  updatedAt?: string
  seo?: LocalSeo
  body?: MinimarkTree
}

export interface LocalCollections {
  settings: LocalSettingsDoc
  pages: LocalPageDoc
  practiceAreas: LocalPracticeAreaDoc
  team: LocalTeamDoc
  categories: LocalCategoryDoc
  posts: LocalPostDoc
}

/** Returns every document of a collection for one locale. */
export interface LocalStore {
  all<K extends keyof LocalCollections>(collection: K, locale: Locale): Promise<Array<LocalCollections[K]>>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** "en/blog/succession-planning" → "succession-planning" */
export const slugOf = (doc: BaseDoc) => doc.stem.split('/').pop()!

function cleanSeo(seo: LocalSeo | undefined, fallback: { title?: string, description?: string }): Seo {
  return {
    title: seo?.title || fallback.title,
    description: seo?.description || fallback.description,
    ...(seo?.image ? { image: seo.image } : {}),
    ...(seo?.noindex ? { noindex: true } : {}),
  }
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export function createLocalSource(store: LocalStore): ContentSource {
  // Memoize per collection+locale for the lifetime of this source instance.
  const cache = new Map<string, Promise<unknown[]>>()
  function all<K extends keyof LocalCollections>(collection: K, locale: Locale): Promise<Array<LocalCollections[K]>> {
    const key = `${collection}:${locale}`
    if (!cache.has(key)) cache.set(key, store.all(collection, locale))
    return cache.get(key) as Promise<Array<LocalCollections[K]>>
  }

  /** Slug of the document with the same translationKey in every locale. */
  async function translationsOf(collection: 'practiceAreas' | 'team' | 'categories' | 'posts', translationKey: string): Promise<Translations> {
    const out: Translations = {}
    for (const l of LOCALES) {
      const match = (await all(collection, l)).find(d => d.translationKey === translationKey)
      if (match) out[l] = slugOf(match)
    }
    return out
  }

  async function toTeamSummary(doc: LocalTeamDoc, locale: Locale): Promise<TeamMemberSummary> {
    return {
      slug: slugOf(doc), locale, name: doc.name, role: doc.role, photo: doc.photo, shortBio: doc.shortBio,
      translations: await translationsOf('team', doc.translationKey),
    }
  }

  async function toAreaSummary(doc: LocalPracticeAreaDoc, locale: Locale): Promise<PracticeAreaSummary> {
    return {
      slug: slugOf(doc), locale, title: doc.title, summary: doc.summary, icon: doc.icon, order: doc.order,
      translations: await translationsOf('practiceAreas', doc.translationKey),
    }
  }

  async function toCategory(doc: LocalCategoryDoc, locale: Locale): Promise<Category> {
    return { slug: slugOf(doc), locale, title: doc.title, translations: await translationsOf('categories', doc.translationKey) }
  }

  async function categoryByKey(key: string, locale: Locale): Promise<Category> {
    const doc = (await all('categories', locale)).find(c => c.translationKey === key)
    if (!doc) throw new Error(`[content:local] Unknown category "${key}" (${locale})`)
    return toCategory(doc, locale)
  }

  async function toPostSummary(doc: LocalPostDoc, locale: Locale): Promise<PostSummary> {
    return {
      slug: slugOf(doc),
      locale,
      title: doc.title,
      excerpt: doc.description,
      cover: doc.cover,
      category: await categoryByKey(doc.category, locale),
      publishedAt: doc.publishedAt,
      readingTime: readingTime(minimarkToRichText(doc.body)),
      translations: await translationsOf('posts', doc.translationKey),
    }
  }

  async function sortedPosts(locale: Locale): Promise<PostSummary[]> {
    const docs = await all('posts', locale)
    const items = await Promise.all(docs.map(d => toPostSummary(d, locale)))
    return items.sort(byPublishedDesc)
  }

  const source: Omit<ContentSource, 'listRoutes'> = {
    async getSiteSettings(locale) {
      const [doc] = await all('settings', locale)
      if (!doc) throw new Error(`[content:local] Missing content/${locale}/settings.yml`)
      return {
        locale,
        firmName: doc.firmName,
        tagline: doc.tagline,
        contact: doc.contact,
        address: doc.address,
        officeHours: doc.officeHours,
        socials: doc.socials ?? [],
        seo: cleanSeo(doc.seo, { title: doc.firmName, description: doc.tagline }),
      }
    },

    async getPage(key, locale) {
      const doc = (await all('pages', locale)).find(p => p.key === key)
      if (!doc) return null
      const body = minimarkToRichText(doc.body)
      const sections = (doc.sections ?? [{ type: 'body' }]).map((s): PageSection => {
        if (s.type === 'body') return { type: 'text', ...(s.heading ? { heading: s.heading } : {}), body }
        if (s.type === 'latestPosts') return { ...s, limit: s.limit ?? 3 }
        return s
      })
      return {
        key,
        locale,
        title: doc.title,
        ...(doc.lead ? { lead: doc.lead } : {}),
        sections,
        seo: cleanSeo(doc.seo, { title: doc.title, description: doc.lead }),
        ...(doc.updatedAt ? { updatedAt: doc.updatedAt } : {}),
      }
    },

    async listPracticeAreas(locale) {
      const docs = await all('practiceAreas', locale)
      return (await Promise.all(docs.map(d => toAreaSummary(d, locale)))).sort(byOrder)
    },

    async getPracticeArea(slug, locale) {
      const doc = (await all('practiceAreas', locale)).find(d => slugOf(d) === slug)
      if (!doc) return null
      const members = (await all('team', locale))
        .filter(m => doc.team?.includes(m.translationKey))
        .sort(byOrder)
      return {
        ...(await toAreaSummary(doc, locale)),
        body: minimarkToRichText(doc.body),
        team: await Promise.all(members.map(m => toTeamSummary(m, locale))),
        seo: cleanSeo(doc.seo, { title: doc.title, description: doc.summary }),
      }
    },

    async listTeamMembers(locale) {
      const docs = [...await all('team', locale)].sort(byOrder)
      return Promise.all(docs.map(d => toTeamSummary(d, locale)))
    },

    async getTeamMember(slug, locale) {
      const doc = (await all('team', locale)).find(d => slugOf(d) === slug)
      if (!doc) return null
      const areas = (await all('practiceAreas', locale))
        .filter(a => doc.areas?.includes(a.translationKey))
      return {
        ...(await toTeamSummary(doc, locale)),
        ...(doc.registration ? { registration: doc.registration } : {}),
        bio: minimarkToRichText(doc.body),
        areas: (await Promise.all(areas.map(a => toAreaSummary(a, locale)))).sort(byOrder),
        ...(doc.email ? { email: doc.email } : {}),
        ...(doc.linkedin ? { linkedin: doc.linkedin } : {}),
        order: doc.order,
        seo: cleanSeo(doc.seo, { title: doc.name, description: doc.shortBio }),
      }
    },

    async listCategories(locale) {
      const docs = await all('categories', locale)
      const cats = await Promise.all(docs.map(d => toCategory(d, locale)))
      return cats.sort((a, b) => a.title.localeCompare(b.title, locale))
    },

    async listPosts(locale, opts = {}) {
      let items = await sortedPosts(locale)
      if (opts.category) items = items.filter(p => p.category.slug === opts.category)
      return paginate(items, opts.page ?? 1, opts.perPage)
    },

    async getPost(slug, locale) {
      const doc = (await all('posts', locale)).find(d => slugOf(d) === slug)
      if (!doc) return null
      const summary = await toPostSummary(doc, locale)
      const authorDoc = (await all('team', locale)).find(m => m.translationKey === doc.author)
      if (!authorDoc) throw new Error(`[content:local] Unknown author "${doc.author}" in ${doc.stem}`)
      const others = (await sortedPosts(locale)).filter(p => p.slug !== summary.slug)
      const related = [
        ...others.filter(p => p.category.slug === summary.category.slug),
        ...others.filter(p => p.category.slug !== summary.category.slug),
      ].slice(0, 3)
      return {
        ...summary,
        body: minimarkToRichText(doc.body),
        tags: doc.tags ?? [],
        author: await toTeamSummary(authorDoc, locale),
        ...(doc.updatedAt ? { updatedAt: doc.updatedAt } : {}),
        seo: cleanSeo(doc.seo, { title: doc.title, description: doc.description }),
        related,
      }
    },
  }

  return { ...source, listRoutes: () => collectRoutes(source) }
}
