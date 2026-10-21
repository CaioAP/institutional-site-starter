/**
 * Source-agnostic domain models. Pages and components import ONLY from here;
 * adapters (lib/content/adapters/*) map CMS-specific shapes into these types.
 */

export const LOCALES = ['pt-BR', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'pt-BR'

/** Slug of the equivalent entity in each locale that has a translation. */
export type Translations = Partial<Record<Locale, string>>

export interface Image {
  src: string
  /** Required by every content schema. Use "" only for purely decorative images. */
  alt: string
  width?: number
  height?: number
}

export interface Seo {
  title?: string
  description?: string
  image?: Image
  noindex?: boolean
}

export interface Link {
  label: string
  /** Internal path (already localized) or absolute URL */
  href: string
}

// ---------------------------------------------------------------------------
// Rich text: one normalized AST rendered by <RichText> for every source.
// ---------------------------------------------------------------------------

/** HTML tags a rich-text body may contain. Anything else is dropped by adapters. */
export const RICH_TEXT_TAGS = [
  'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'a', 'code', 'pre',
  'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'figure', 'figcaption', 'sup', 'sub',
] as const
export type RichTextTag = (typeof RICH_TEXT_TAGS)[number]

export type VideoProvider = 'youtube' | 'vimeo'

export type RichTextNode
  = | { type: 'text', value: string }
    | { type: 'element', tag: RichTextTag, attrs?: { href?: string, id?: string }, children: RichTextNode[] }
    | { type: 'image', image: Image, caption?: string }
    | { type: 'video', provider: VideoProvider, id: string, title: string, caption?: string }

export interface RichText {
  nodes: RichTextNode[]
}

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface SocialLink {
  label: string
  url: string
  icon: 'linkedin' | 'instagram' | 'facebook' | 'youtube' | 'x'
}

export interface SiteSettings {
  locale: Locale
  firmName: string
  tagline: string
  contact: {
    email: string
    phone: string
    /** Digits only with country code, e.g. 5511900000000. Empty disables the button. */
    whatsapp: string
  }
  address: {
    street: string
    city: string
    region: string
    postalCode: string
    country: string
    mapUrl: string
  }
  officeHours: string
  socials: SocialLink[]
  seo: Seo
}

export type PageSection
  = | {
    type: 'hero'
    heading: string
    text?: string
    /** Muted, looping background video; `image` is its poster and the reduced-motion fallback. */
    video?: { src: string, type: string }
    image: Image
    cta?: Link
  }
  | { type: 'text', heading?: string, body: RichText }
  | { type: 'highlights', heading?: string, items: Array<{ title: string, text: string, icon?: string }> }
  | { type: 'cta', heading: string, text?: string, link: Link }
  /** Data-driven blocks: content comes from other collections */
  | { type: 'practiceAreas', heading: string, text?: string }
  | { type: 'team', heading: string, text?: string }
  | { type: 'latestPosts', heading: string, limit: number }
  | { type: 'location', heading: string, text?: string }

/** Stable keys of editorial pages. Their localized paths live in i18n/routes.ts. */
export const PAGE_KEYS = ['home', 'about', 'contact', 'search', 'privacy', 'terms'] as const
export type PageKey = (typeof PAGE_KEYS)[number]

export interface Page {
  key: PageKey
  locale: Locale
  title: string
  /** Optional intro text under the h1 */
  lead?: string
  sections: PageSection[]
  seo: Seo
  updatedAt?: string
}

export interface TeamMemberSummary {
  slug: string
  locale: Locale
  name: string
  role: string
  photo: Image
  shortBio: string
  translations: Translations
}

export interface PracticeAreaSummary {
  slug: string
  locale: Locale
  title: string
  summary: string
  icon: string
  order: number
  translations: Translations
}

export interface PracticeArea extends PracticeAreaSummary {
  body: RichText
  team: TeamMemberSummary[]
  seo: Seo
}

export interface TeamMember extends TeamMemberSummary {
  /** e.g. "OAB/SP 000.000" – free text, optional */
  registration?: string
  bio: RichText
  areas: PracticeAreaSummary[]
  email?: string
  linkedin?: string
  order: number
  seo: Seo
}

export interface Category {
  slug: string
  locale: Locale
  title: string
  translations: Translations
}

export interface PostSummary {
  slug: string
  locale: Locale
  title: string
  excerpt: string
  cover: Image
  category: Category
  publishedAt: string
  /** Minutes, rounded up */
  readingTime: number
  translations: Translations
}

export interface Post extends PostSummary {
  body: RichText
  tags: string[]
  author: TeamMemberSummary
  updatedAt?: string
  seo: Seo
  related: PostSummary[]
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageCount: number
  perPage: number
  total: number
}

/** Route names come from i18n/routes.ts. */
export interface LocalizedRoute {
  name: string
  locale: Locale
  params: Record<string, string>
  /** Final URL path, e.g. /en/practice-areas/corporate-law */
  path: string
  /** Same route in the other locales, when a translation exists */
  alternates: Partial<Record<Locale, string>>
  lastmod?: string
}
