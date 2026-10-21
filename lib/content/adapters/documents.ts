/**
 * Shared mapping from normalized documents to the domain models.
 *
 * Every adapter turns its CMS-specific shapes into these documents (one array
 * per collection and locale, rich text already normalized), and
 * `createDocumentSource` does the rest: SEO fallbacks, sorting, references,
 * translations, related posts and routes. So sorting or fallback rules can't
 * drift between sources, and the same content renders identically.
 *
 * Documents link translations and references with `translationKey`, which is
 * the same in every locale: the Markdown front matter value for the local
 * source, the translation metadata document for Sanity.
 */
import type { ContentSource } from '../source'
import { collectRoutes } from '../source'
import type {
  Category, Image, Locale, PageKey, PageSection, PracticeAreaSummary, PostSummary, RichText, Seo, SiteSettings,
  SocialLink, TeamMemberSummary, Translations,
} from '../types'
import { LOCALES } from '../types'
import { byOrder, byPublishedDesc, paginate, readingTime } from '../utils'

export interface DocSeo {
  title?: string
  description?: string
  image?: Image
  noindex?: boolean
}

export interface SettingsDoc {
  firmName: string
  tagline: string
  contact: SiteSettings['contact']
  address: SiteSettings['address']
  officeHours: string
  socials?: SocialLink[]
  seo?: DocSeo
}

export interface PageDoc {
  key: PageKey
  title: string
  lead?: string
  sections: PageSection[]
  seo?: DocSeo
  updatedAt?: string
}

export interface PracticeAreaDoc {
  slug: string
  translationKey: string
  title: string
  summary: string
  icon: string
  order: number
  /** translationKeys of team members */
  team?: string[]
  seo?: DocSeo
  body: RichText
}

export interface TeamDoc {
  slug: string
  translationKey: string
  name: string
  role: string
  registration?: string
  photo: Image
  shortBio: string
  /** translationKeys of practice areas */
  areas?: string[]
  email?: string
  linkedin?: string
  order: number
  seo?: DocSeo
  body: RichText
}

export interface CategoryDoc {
  slug: string
  translationKey: string
  title: string
}

export interface PostDoc {
  slug: string
  translationKey: string
  title: string
  description: string
  cover: Image
  /** translationKey of the category */
  category: string
  tags?: string[]
  /** translationKey of the author (a team member) */
  author: string
  publishedAt: string
  updatedAt?: string
  seo?: DocSeo
  body: RichText
}

export interface DocCollections {
  settings: SettingsDoc
  pages: PageDoc
  practiceAreas: PracticeAreaDoc
  team: TeamDoc
  categories: CategoryDoc
  posts: PostDoc
}

/** Returns every document of a collection for one locale. */
export interface DocumentStore {
  all<K extends keyof DocCollections>(collection: K, locale: Locale): Promise<Array<DocCollections[K]>>
}

function cleanSeo(seo: DocSeo | undefined, fallback: { title?: string, description?: string }): Seo {
  return {
    title: seo?.title || fallback.title,
    description: seo?.description || fallback.description,
    ...(seo?.image ? { image: seo.image } : {}),
    ...(seo?.noindex ? { noindex: true } : {}),
  }
}

/**
 * @param name Used in error messages, e.g. "local" or "sanity".
 */
export function createDocumentSource(store: DocumentStore, name: string): ContentSource {
  // Memoize per collection+locale for the lifetime of this source instance.
  const cache = new Map<string, Promise<unknown[]>>()
  function all<K extends keyof DocCollections>(collection: K, locale: Locale): Promise<Array<DocCollections[K]>> {
    const key = `${collection}:${locale}`
    if (!cache.has(key)) cache.set(key, store.all(collection, locale))
    return cache.get(key) as Promise<Array<DocCollections[K]>>
  }

  /** Slug of the document with the same translationKey in every locale. */
  async function translationsOf(collection: 'practiceAreas' | 'team' | 'categories' | 'posts', translationKey: string): Promise<Translations> {
    const out: Translations = {}
    for (const l of LOCALES) {
      const match = (await all(collection, l)).find(d => d.translationKey === translationKey)
      if (match) out[l] = match.slug
    }
    return out
  }

  async function toTeamSummary(doc: TeamDoc, locale: Locale): Promise<TeamMemberSummary> {
    return {
      slug: doc.slug, locale, name: doc.name, role: doc.role, photo: doc.photo, shortBio: doc.shortBio,
      translations: await translationsOf('team', doc.translationKey),
    }
  }

  async function toAreaSummary(doc: PracticeAreaDoc, locale: Locale): Promise<PracticeAreaSummary> {
    return {
      slug: doc.slug, locale, title: doc.title, summary: doc.summary, icon: doc.icon, order: doc.order,
      translations: await translationsOf('practiceAreas', doc.translationKey),
    }
  }

  async function toCategory(doc: CategoryDoc, locale: Locale): Promise<Category> {
    return { slug: doc.slug, locale, title: doc.title, translations: await translationsOf('categories', doc.translationKey) }
  }

  async function categoryByKey(key: string, locale: Locale): Promise<Category> {
    const doc = (await all('categories', locale)).find(c => c.translationKey === key)
    if (!doc) throw new Error(`[content:${name}] Unknown category "${key}" (${locale})`)
    return toCategory(doc, locale)
  }

  async function toPostSummary(doc: PostDoc, locale: Locale): Promise<PostSummary> {
    return {
      slug: doc.slug,
      locale,
      title: doc.title,
      excerpt: doc.description,
      cover: doc.cover,
      category: await categoryByKey(doc.category, locale),
      publishedAt: doc.publishedAt,
      readingTime: readingTime(doc.body),
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
      if (!doc) throw new Error(`[content:${name}] Missing site settings for ${locale}`)
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
      return {
        key,
        locale,
        title: doc.title,
        ...(doc.lead ? { lead: doc.lead } : {}),
        sections: doc.sections,
        seo: cleanSeo(doc.seo, { title: doc.title, description: doc.lead }),
        ...(doc.updatedAt ? { updatedAt: doc.updatedAt } : {}),
      }
    },

    async listPracticeAreas(locale) {
      const docs = await all('practiceAreas', locale)
      return (await Promise.all(docs.map(d => toAreaSummary(d, locale)))).sort(byOrder)
    },

    async getPracticeArea(slug, locale) {
      const doc = (await all('practiceAreas', locale)).find(d => d.slug === slug)
      if (!doc) return null
      const members = (await all('team', locale))
        .filter(m => doc.team?.includes(m.translationKey))
        .sort(byOrder)
      return {
        ...(await toAreaSummary(doc, locale)),
        body: doc.body,
        team: await Promise.all(members.map(m => toTeamSummary(m, locale))),
        seo: cleanSeo(doc.seo, { title: doc.title, description: doc.summary }),
      }
    },

    async listTeamMembers(locale) {
      const docs = [...await all('team', locale)].sort(byOrder)
      return Promise.all(docs.map(d => toTeamSummary(d, locale)))
    },

    async getTeamMember(slug, locale) {
      const doc = (await all('team', locale)).find(d => d.slug === slug)
      if (!doc) return null
      const areas = (await all('practiceAreas', locale))
        .filter(a => doc.areas?.includes(a.translationKey))
      return {
        ...(await toTeamSummary(doc, locale)),
        ...(doc.registration ? { registration: doc.registration } : {}),
        bio: doc.body,
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
      const doc = (await all('posts', locale)).find(d => d.slug === slug)
      if (!doc) return null
      const summary = await toPostSummary(doc, locale)
      const authorDoc = (await all('team', locale)).find(m => m.translationKey === doc.author)
      if (!authorDoc) throw new Error(`[content:${name}] Unknown author "${doc.author}" in post "${doc.slug}" (${locale})`)
      const others = (await sortedPosts(locale)).filter(p => p.slug !== summary.slug)
      const related = [
        ...others.filter(p => p.category.slug === summary.category.slug),
        ...others.filter(p => p.category.slug !== summary.category.slug),
      ].slice(0, 3)
      return {
        ...summary,
        body: doc.body,
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
