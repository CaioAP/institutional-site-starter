import { RICH_TEXT_TAGS, type RichText, type RichTextNode, type RichTextTag, type VideoProvider } from '../types'
import { safeHref } from './sanitize'

/**
 * Converts Nuxt Content's "minimark" body (compact HAST-like arrays) into the
 * normalized RichText AST. Only whitelisted tags survive; unknown wrappers are
 * unwrapped, and scripts/styles/iframes are dropped.
 */
export type MinimarkNode = string | [string, Record<string, unknown>, ...MinimarkNode[]]
export interface MinimarkTree { type: string, value: MinimarkNode[] }

const DROP = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'])
const isTag = (t: string): t is RichTextTag => (RICH_TEXT_TAGS as readonly string[]).includes(t)
const str = (v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : undefined)
const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number.parseInt(v, 10) : Number.NaN
  return Number.isFinite(n) ? n : undefined
}

function convert(node: MinimarkNode, block: boolean): RichTextNode[] {
  if (typeof node === 'string') {
    if (block && !node.trim()) return []
    return [{ type: 'text', value: node }]
  }
  const [rawTag, props = {}, ...children] = node
  let tag = rawTag.toLowerCase()
  if (DROP.has(tag)) return []

  if (tag === 'img') {
    const src = str(props.src)
    if (!src) return []
    return [{ type: 'image', image: { src, alt: str(props.alt) ?? '', width: num(props.width), height: num(props.height) } }]
  }

  if (tag === 'video-embed' || tag === 'video') {
    const provider = str(props.provider) as VideoProvider | undefined
    const id = str(props.id)
    if (!id || (provider !== 'youtube' && provider !== 'vimeo')) return []
    return [{ type: 'video', provider, id, title: str(props.title) ?? '', caption: str(props.caption) }]
  }

  // A paragraph that only wraps images becomes standalone image blocks.
  if (tag === 'p') {
    const meaningful = children.filter(c => typeof c !== 'string' || c.trim())
    if (meaningful.length && meaningful.every(c => Array.isArray(c) && c[0] === 'img')) {
      return meaningful.flatMap(c => convert(c, false))
    }
  }

  if (tag === 'h1') tag = 'h2' // pages own the single <h1>
  if (tag === 'h5' || tag === 'h6') tag = 'h4'

  const childBlock = tag === 'ul' || tag === 'ol' || tag === 'table' || tag === 'thead' || tag === 'tbody' || tag === 'tr' || tag === 'blockquote'
  const kids = children.flatMap(c => convert(c, childBlock))

  if (!isTag(tag)) return kids // unwrap unknown elements (span, div, custom components)

  const attrs: { href?: string, id?: string } = {}
  if (tag === 'a') {
    const href = safeHref(str(props.href))
    if (!href) return kids
    attrs.href = href
  }
  if ((tag === 'h2' || tag === 'h3' || tag === 'h4') && str(props.id)) attrs.id = str(props.id)

  return [{ type: 'element', tag, ...(Object.keys(attrs).length ? { attrs } : {}), children: kids }]
}

export function minimarkToRichText(tree: MinimarkTree | null | undefined): RichText {
  if (!tree?.value?.length) return { nodes: [] }
  return { nodes: tree.value.flatMap(n => convert(n, true)) }
}
