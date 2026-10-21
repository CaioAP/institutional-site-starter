import type { Paginated, RichText, RichTextNode } from './types'

export const POSTS_PER_PAGE = 6
const WORDS_PER_MINUTE = 200

export function richTextToPlain(body: RichText): string {
  const out: string[] = []
  const walk = (nodes: RichTextNode[]) => {
    for (const n of nodes) {
      if (n.type === 'text') out.push(n.value)
      else if (n.type === 'element') walk(n.children)
      else if (n.type === 'image' && n.caption) out.push(n.caption)
      else if (n.type === 'video') out.push(n.title)
      if (n.type === 'element' && ['p', 'h2', 'h3', 'h4', 'li', 'blockquote', 'td', 'th'].includes(n.tag)) out.push(' ')
    }
  }
  walk(body.nodes)
  return out.join('').replace(/\s+/g, ' ').trim()
}

/** Reading time in whole minutes (minimum 1). */
export function readingTime(body: RichText): number {
  const words = richTextToPlain(body).split(' ').filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

export function paginate<T>(items: T[], page = 1, perPage = POSTS_PER_PAGE): Paginated<T> {
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, Math.floor(page)), pageCount)
  return {
    items: items.slice((current - 1) * perPage, current * perPage),
    page: current,
    pageCount,
    perPage,
    total,
  }
}

/** Newest first; ties broken by slug for stable output. */
export function byPublishedDesc<T extends { publishedAt: string, slug: string }>(a: T, b: T): number {
  return b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug)
}

export function byOrder<T extends { order: number }>(a: T, b: T): number {
  return a.order - b.order
}
