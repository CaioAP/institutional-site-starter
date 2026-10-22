/**
 * Local adapter: content lives as Markdown/YAML in content/<locale>/... and is
 * read through Nuxt Content. The adapter itself is framework-free: it receives
 * a `LocalStore` (in the app, a thin wrapper around `queryCollection`; in tests,
 * in-memory fixtures), normalizes the raw documents (slug from the file name,
 * Markdown body to RichText) and hands them to the shared mapper in
 * ./documents.ts.
 *
 * Cross-references (author, category, team, areas) use `translationKey`,
 * which is the same in every locale.
 */
import type { ContentSource } from '../source'
import type { Image, Locale, PageKey, PageSection, SiteSettings, SocialLink } from '../types'
import { minimarkToRichText, type MinimarkTree } from '../rich-text/minimark'
import { createDocumentSource, type DocCollections, type DocumentStore, type PageDoc } from './documents'

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
// Adapter
// ---------------------------------------------------------------------------

/** "en/blog/succession-planning" → "succession-planning" */
export const slugOf = (doc: BaseDoc) => doc.stem.split('/').pop()!

function toPageDoc(doc: LocalPageDoc): PageDoc {
  const body = minimarkToRichText(doc.body)
  const sections = (doc.sections ?? [{ type: 'body' }]).map((s): PageSection => {
    if (s.type === 'body') return { type: 'text', ...(s.heading ? { heading: s.heading } : {}), body }
    if (s.type === 'latestPosts') return { ...s, limit: s.limit ?? 3 }
    return s
  })
  const { stem: _stem, body: _body, ...rest } = doc
  return { ...rest, sections }
}

/** Normalized documents (shared by the source and the Sanity seed script). */
export function createLocalDocumentStore(store: LocalStore): DocumentStore {
  return {
    async all(collection, locale) {
      const docs = await store.all(collection, locale)
      if (collection === 'pages') return (docs as LocalPageDoc[]).map(toPageDoc) as never
      if (collection === 'settings') return docs as never
      return docs.map((doc) => {
        const { stem: _stem, ...rest } = doc as LocalCollections['posts']
        const slug = slugOf(doc)
        return collection === 'categories' ? { ...rest, slug } : { ...rest, slug, body: minimarkToRichText(rest.body) }
      }) as Array<DocCollections[typeof collection]>
    },
  }
}

export function createLocalSource(store: LocalStore): ContentSource {
  return createDocumentSource(createLocalDocumentStore(store), 'local')
}
