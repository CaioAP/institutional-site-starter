/**
 * Sanity adapter: reads the documents defined in studios/sanity/schemas with
 * GROQ and normalizes them for the shared mapper in ./documents.ts.
 *
 * Framework-free: it receives a `SanityFetcher`, which is @sanity/client in
 * production and groq-js over the seed file offline and in tests (see
 * ./sanity-fetcher.ts).
 *
 * Translations use @sanity/document-internationalization: every document has
 * a `language` field, and a `translation.metadata` document references all
 * language versions of the same entity. That metadata id is the
 * `translationKey`; a document without translations uses its own id.
 * References (author, category, team, areas) point at documents in the same
 * language and are mapped to the referenced document's translationKey.
 */
import type { ContentSource } from '../source'
import type { Locale, PageSection, RichText } from '../types'
import { portableTextToRichText, type PtNode } from '../rich-text/portable-text'
import { createDocumentSource, type DocCollections, type DocumentStore } from './documents'

export interface SanityFetcher {
  fetch<T>(query: string, params: Record<string, unknown>): Promise<T>
}

/** Document type in Sanity for each collection. */
export const SANITY_TYPES = {
  settings: 'siteSettings',
  pages: 'page',
  practiceAreas: 'practiceArea',
  team: 'teamMember',
  categories: 'category',
  posts: 'post',
} as const satisfies Record<keyof DocCollections, string>

/** Section `_type` in Sanity → PageSection `type`. */
export const SANITY_SECTION_TYPES = {
  hero: 'hero',
  textSection: 'text',
  highlights: 'highlights',
  ctaSection: 'cta',
  practiceAreasSection: 'practiceAreas',
  teamSection: 'team',
  latestPostsSection: 'latestPosts',
  locationSection: 'location',
} as const satisfies Record<string, PageSection['type']>

// ---------------------------------------------------------------------------
// GROQ
// ---------------------------------------------------------------------------

const IMAGE = `{
  "src": asset->url,
  "alt": coalesce(alt, ""),
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
}`
const SEO = `seo{ title, description, noindex, "image": image${IMAGE} }`
const RICH_TEXT = `[]{
  ...,
  _type == "image" => {
    "src": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  }
}`
const TRANSLATION_KEY = `"translationKey": coalesce(*[_type == "translation.metadata" && references(^._id)][0]._id, _id)`
const BASE = `*[_type == $type && language == $locale && !(_id in path("drafts.**"))]`

export const SANITY_QUERIES: Record<keyof DocCollections, string> = {
  settings: `${BASE}{
    firmName, tagline, contact, address, officeHours,
    socials[]{ label, url, icon },
    ${SEO}
  }`,
  pages: `${BASE}{
    key, title, lead,
    "updatedAt": coalesce(updatedAt, _updatedAt),
    sections[]{
      ...,
      _type == "hero" => {
        "image": image${IMAGE},
        "video": video{ "src": asset->url, "type": asset->mimeType }
      },
      _type == "textSection" => { "body": body${RICH_TEXT} },
      _type == "latestPostsSection" => { "limit": coalesce(limit, 3) }
    },
    ${SEO}
  }`,
  practiceAreas: `${BASE}{
    _id, ${TRANSLATION_KEY}, "slug": slug.current,
    title, summary, icon, order,
    "team": team[]._ref,
    ${SEO},
    "body": body${RICH_TEXT}
  }`,
  team: `${BASE}{
    _id, ${TRANSLATION_KEY}, "slug": slug.current,
    name, role, registration, "photo": photo${IMAGE}, shortBio,
    "areas": areas[]._ref,
    email, linkedin, order,
    ${SEO},
    "body": bio${RICH_TEXT}
  }`,
  categories: `${BASE}{ _id, ${TRANSLATION_KEY}, "slug": slug.current, title }`,
  posts: `${BASE}{
    _id, ${TRANSLATION_KEY}, "slug": slug.current,
    title, "description": excerpt, "cover": cover${IMAGE},
    "category": category._ref, tags, "author": author._ref,
    publishedAt, updatedAt,
    ${SEO},
    "body": body${RICH_TEXT}
  }`,
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

/** GROQ returns null for missing fields; documents use absent keys. Also drops Sanity's `_key`/`_type` (applied after sections and rich text are converted). */
function clean<T>(value: T): T {
  if (Array.isArray(value)) return value.filter(v => v !== null).map(clean) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).filter(([k, v]) => v !== null && k !== '_key' && k !== '_type').map(([k, v]) => [k, clean(v)]),
    ) as T
  }
  return value
}

interface RawSection { _type: string, body?: PtNode[], [key: string]: unknown }

function toSection(raw: RawSection): PageSection | null {
  const type = SANITY_SECTION_TYPES[raw._type as keyof typeof SANITY_SECTION_TYPES]
  if (!type) return null
  const { _type, body, ...rest } = raw
  if (type === 'text') return { ...rest, type, body: portableTextToRichText(body) } as PageSection
  return { ...rest, type } as PageSection
}

type WithBody<T> = Omit<T, 'body'> & { _id: string, body?: PtNode[] }

export function createSanitySource(client: SanityFetcher): ContentSource {
  const fetched = new Map<string, Promise<unknown[]>>()
  function raw<T>(collection: keyof DocCollections, locale: Locale): Promise<T[]> {
    const key = `${collection}:${locale}`
    if (!fetched.has(key)) {
      fetched.set(key, client.fetch<T[]>(SANITY_QUERIES[collection], { type: SANITY_TYPES[collection], locale }))
    }
    return fetched.get(key) as Promise<T[]>
  }

  /** Document id → translationKey, for references within one locale. */
  async function keys(collection: 'practiceAreas' | 'team' | 'categories', locale: Locale) {
    const docs = await raw<{ _id: string, translationKey: string }>(collection, locale)
    const map = new Map(docs.map(d => [d._id, d.translationKey]))
    return (ref: string) => map.get(ref) ?? ref
  }

  const withBody = <T extends { body: RichText }>({ _id, body, ...doc }: WithBody<T>) =>
    ({ ...doc, body: portableTextToRichText(body) }) as unknown as T

  const store: DocumentStore = {
    async all(collection, locale) {
      switch (collection) {
        case 'settings':
          return clean(await raw(collection, locale)) as never
        case 'pages': {
          const pages = await raw<{ sections?: RawSection[] }>(collection, locale)
          return clean(pages.map(p => ({ ...p, sections: (p.sections ?? []).map(toSection).filter(Boolean) }))) as never
        }
        case 'categories':
          return clean((await raw<DocCollections['categories'] & { _id?: string }>(collection, locale)).map(({ _id, ...c }) => c)) as never
        case 'practiceAreas': {
          const teamKey = await keys('team', locale)
          const docs = await raw<WithBody<DocCollections['practiceAreas']>>(collection, locale)
          return clean(docs.map(d => withBody<DocCollections['practiceAreas']>({ ...d, team: d.team?.map(teamKey) }))) as never
        }
        case 'team': {
          const areaKey = await keys('practiceAreas', locale)
          const docs = await raw<WithBody<DocCollections['team']>>(collection, locale)
          return clean(docs.map(d => withBody<DocCollections['team']>({ ...d, areas: d.areas?.map(areaKey) }))) as never
        }
        case 'posts': {
          const [categoryKey, authorKey] = await Promise.all([keys('categories', locale), keys('team', locale)])
          const docs = await raw<WithBody<DocCollections['posts']>>(collection, locale)
          return clean(docs.map(d => withBody<DocCollections['posts']>({ ...d, category: categoryKey(d.category), author: authorKey(d.author) }))) as never
        }
      }
    },
  }
  return createDocumentSource(store, 'sanity')
}
