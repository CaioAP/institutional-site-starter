/**
 * Builds the Sanity seed from the local content, so both CMS samples start
 * with exactly the same content:
 *
 *   studios/sanity/seed/content.ndjson  documents for `sanity dataset import`
 *   studios/sanity/seed/assets.json     dimensions/MIME type of each uploaded file
 *
 * Reads Nuxt Content's database (.data/content/contents.sqlite), which any
 * build creates, so run `pnpm generate` (or `pnpm dev` once) first.
 *
 * Usage: node scripts/sanity-seed.ts
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { readLocalContent } from '../lib/content/adapters/local-sqlite.ts'
import type { DocCollections, DocSeo } from '../lib/content/adapters/documents.ts'
import { createLocalDocumentStore } from '../lib/content/adapters/local.ts'
import { SANITY_SECTION_TYPES, SANITY_TYPES } from '../lib/content/adapters/sanity.ts'
import { SEED_DIR, type SeedAssets } from '../lib/content/adapters/sanity-fetcher.ts'
import { richTextToPortableText } from '../lib/content/rich-text/portable-text.ts'
import type { Image, Locale, PageSection, RichText } from '../lib/content/types.ts'
import { LOCALES } from '../lib/content/types.ts'

const root = process.cwd()
const store = createLocalDocumentStore(await readLocalContent(root))

const docs: Array<Record<string, unknown>> = []
const assets: SeedAssets = {}

// Deterministic keys keep the seed diff-friendly.
let keyCounter = 0
const key = () => `k${(keyCounter++).toString(36)}`

const assetPath = (src: string) => (/^https?:/.test(src) ? src : `./public${src}`)

/** `altImage` for image fields; rich text images are plain `image` blocks. */
function image(img: Image, caption?: string, _type = 'altImage') {
  const path = assetPath(img.src)
  assets[path] = { width: img.width, height: img.height }
  return { _type, _sanityAsset: `image@${path.startsWith('http') ? path : `file://${path}`}`, alt: img.alt, ...(caption ? { caption } : {}) }
}

function file(src: string, mimeType: string) {
  const path = assetPath(src)
  assets[path] = { mimeType }
  return { _type: 'file', _sanityAsset: `file@${path.startsWith('http') ? path : `file://${path}`}` }
}

const portableText = (body: RichText) => richTextToPortableText(body, { image: (img, caption) => image(img, caption, 'image'), key })
const ref = (id: string) => ({ _type: 'reference', _ref: id })
const keyedRef = (id: string) => ({ _key: key(), ...ref(id) })
const slug = (current: string) => ({ _type: 'slug', current })

function seo(value: DocSeo | undefined) {
  if (!value) return undefined
  const { image: img, ...rest } = value
  return { ...rest, ...(img ? { image: image(img) } : {}) }
}

function section(s: PageSection) {
  const _type = Object.entries(SANITY_SECTION_TYPES).find(([, t]) => t === s.type)![0]
  switch (s.type) {
    case 'text':
      return { _type, _key: key(), ...(s.heading ? { heading: s.heading } : {}), body: portableText(s.body) }
    case 'hero': {
      const { type: _t, image: img, video, ...rest } = s
      return { _type, _key: key(), ...rest, image: image(img), ...(video ? { video: file(video.src, video.type) } : {}) }
    }
    case 'highlights':
      return { _type, _key: key(), ...(s.heading ? { heading: s.heading } : {}), items: s.items.map(i => ({ _type: 'highlight', _key: key(), ...i })) }
    default: {
      const { type: _t, ...rest } = s
      return { _type, _key: key(), ...rest }
    }
  }
}

const id = (collection: keyof DocCollections, k: string, locale: Locale) => `${SANITY_TYPES[collection]}-${k}-${locale}`

/** Translation metadata per entity, as @sanity/document-internationalization stores it. */
const translations = new Map<string, { schemaType: string, refs: Array<[Locale, string]> }>()
function translated(collection: keyof DocCollections, k: string, locale: Locale) {
  const metaId = `translation-${SANITY_TYPES[collection]}-${k}`
  const entry = translations.get(metaId) ?? { schemaType: SANITY_TYPES[collection], refs: [] }
  entry.refs.push([locale, id(collection, k, locale)])
  translations.set(metaId, entry)
  return { _id: id(collection, k, locale), _type: SANITY_TYPES[collection], language: locale }
}

for (const locale of LOCALES) {
  for (const s of await store.all('settings', locale)) {
    docs.push({
      ...translated('settings', 'site', locale),
      firmName: s.firmName, tagline: s.tagline, contact: s.contact, address: s.address, officeHours: s.officeHours,
      socials: (s.socials ?? []).map(x => ({ _type: 'social', _key: key(), ...x })),
      ...(s.seo ? { seo: seo(s.seo) } : {}),
    })
  }
  for (const p of await store.all('pages', locale)) {
    docs.push({
      ...translated('pages', p.key, locale),
      key: p.key, title: p.title,
      ...(p.lead ? { lead: p.lead } : {}),
      sections: p.sections.map(section),
      ...(p.seo ? { seo: seo(p.seo) } : {}),
      ...(p.updatedAt ? { updatedAt: p.updatedAt } : {}),
    })
  }
  for (const c of await store.all('categories', locale)) {
    docs.push({ ...translated('categories', c.translationKey, locale), slug: slug(c.slug), title: c.title })
  }
  for (const a of await store.all('practiceAreas', locale)) {
    docs.push({
      ...translated('practiceAreas', a.translationKey, locale),
      slug: slug(a.slug), title: a.title, summary: a.summary, icon: a.icon, order: a.order,
      team: (a.team ?? []).map(k => keyedRef(id('team', k, locale))),
      ...(a.seo ? { seo: seo(a.seo) } : {}),
      body: portableText(a.body),
    })
  }
  for (const m of await store.all('team', locale)) {
    docs.push({
      ...translated('team', m.translationKey, locale),
      slug: slug(m.slug), name: m.name, role: m.role,
      ...(m.registration ? { registration: m.registration } : {}),
      photo: image(m.photo), shortBio: m.shortBio,
      areas: (m.areas ?? []).map(k => keyedRef(id('practiceAreas', k, locale))),
      ...(m.email ? { email: m.email } : {}),
      ...(m.linkedin ? { linkedin: m.linkedin } : {}),
      order: m.order,
      ...(m.seo ? { seo: seo(m.seo) } : {}),
      bio: portableText(m.body),
    })
  }
  for (const p of await store.all('posts', locale)) {
    docs.push({
      ...translated('posts', p.translationKey, locale),
      slug: slug(p.slug), title: p.title, excerpt: p.description, cover: image(p.cover),
      category: ref(id('categories', p.category, locale)),
      tags: p.tags ?? [],
      author: ref(id('team', p.author, locale)),
      publishedAt: p.publishedAt,
      ...(p.updatedAt ? { updatedAt: p.updatedAt } : {}),
      ...(p.seo ? { seo: seo(p.seo) } : {}),
      body: portableText(p.body),
    })
  }
}

for (const [metaId, { schemaType, refs }] of translations) {
  if (refs.length < 2) continue // a document without translations needs no metadata
  docs.push({
    _id: metaId,
    _type: 'translation.metadata',
    schemaTypes: [schemaType],
    translations: refs.map(([language, docId]) => ({
      _key: language,
      _type: 'internationalizedArrayReferenceValue',
      language,
      value: { _type: 'reference', _ref: docId, _weak: true },
    })),
  })
}

const dir = join(root, SEED_DIR)
await mkdir(dir, { recursive: true })
await writeFile(join(dir, 'content.ndjson'), `${docs.map(d => JSON.stringify(d)).join('\n')}\n`)
const sortedAssets = Object.fromEntries(Object.entries(assets).sort(([a], [b]) => a.localeCompare(b)))
await writeFile(join(dir, 'assets.json'), `${JSON.stringify(sortedAssets, null, 2)}\n`)
console.log(`[sanity-seed] ${docs.length} documents, ${Object.keys(assets).length} assets → ${SEED_DIR}`)
