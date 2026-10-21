import GithubSlugger from 'github-slugger'
import type { Image, RichText, RichTextNode, RichTextTag } from '../types'
import { safeHref } from './sanitize'
import { parseVideoUrl, videoUrl } from './video'

/**
 * Sanity Portable Text <-> normalized RichText AST.
 *
 * The Sanity schema (studios/sanity/schemas/objects/richText.ts) allows exactly
 * what converts losslessly: paragraphs, h2–h4, blockquotes, bullet/numbered
 * lists (nested by level), bold/italic/code/sub/sup, links, images with alt
 * and caption, and YouTube/Vimeo embeds. Tables, code blocks and horizontal
 * rules have no Portable Text equivalent in the sample schema, so
 * `richTextToPortableText` refuses them instead of dropping content silently.
 */

export interface PtSpan { _type: 'span', _key?: string, text: string, marks?: string[] }
export interface PtLink { _type: 'link', _key: string, href: string }
export interface PtBlock {
  _type: 'block'
  _key?: string
  style?: string
  listItem?: 'bullet' | 'number'
  level?: number
  markDefs?: PtLink[]
  children: PtSpan[]
}
/** Image block as the adapter's GROQ projection returns it (asset resolved). */
export interface PtImage { _type: 'image', _key?: string, src: string, alt?: string, width?: number, height?: number, caption?: string }
/** A YouTube or Vimeo link, as pasted by the editor. */
export interface PtVideo { _type: 'videoEmbed', _key?: string, url: string, title?: string, caption?: string }
export type PtNode = PtBlock | PtImage | PtVideo | { _type: string, _key?: string }

const DECORATORS = ['strong', 'em', 'code', 'sub', 'sup'] as const
type Decorator = (typeof DECORATORS)[number]
const isDecorator = (m: string): m is Decorator => (DECORATORS as readonly string[]).includes(m)
const STYLES = ['normal', 'h2', 'h3', 'h4', 'blockquote'] as const

// ---------------------------------------------------------------------------
// Portable Text -> RichText (used by the Sanity adapter)
// ---------------------------------------------------------------------------

/** Same ids Nuxt Content (MDC) gives Markdown headings, so anchors match. */
function headingId(slugger: GithubSlugger, text: string): string {
  return slugger.slug(text).replace(/-+/g, '-').replace(/^-|-$/g, '').replace(/^(\d)/, '_$1')
}

function inline(block: PtBlock): RichTextNode[] {
  const links = new Map((block.markDefs ?? []).map(d => [d._key, d]))
  const out: RichTextNode[] = []
  for (const span of block.children ?? []) {
    if (span._type !== 'span' || !span.text) continue
    let node: RichTextNode = { type: 'text', value: span.text }
    // marks are stored outermost first; wrap from the inside out
    for (const mark of [...(span.marks ?? [])].reverse()) {
      if (isDecorator(mark)) node = { type: 'element', tag: mark, children: [node] }
      else {
        const href = safeHref(links.get(mark)?.href)
        if (href) node = { type: 'element', tag: 'a', attrs: { href }, children: [node] }
      }
    }
    const prev = out.at(-1)
    // merge adjacent text and adjacent identical wrappers (one <a> per link)
    if (prev?.type === 'text' && node.type === 'text') prev.value += node.value
    else if (prev?.type === 'element' && node.type === 'element' && prev.tag === node.tag && prev.attrs?.href === node.attrs?.href) {
      prev.children.push(...node.children)
    }
    else out.push(node)
  }
  return out
}

const plain = (block: PtBlock) => (block.children ?? []).map(c => c.text ?? '').join('')

export function portableTextToRichText(blocks: PtNode[] | null | undefined): RichText {
  const slugger = new GithubSlugger()
  const nodes: RichTextNode[] = []
  /** Open lists by nesting level (1-based). */
  let lists: Array<Extract<RichTextNode, { type: 'element' }>> = []
  let quote: Extract<RichTextNode, { type: 'element' }> | undefined

  for (const raw of blocks ?? []) {
    if (raw._type === 'block' && (raw as PtBlock).listItem) {
      const block = raw as PtBlock
      quote = undefined
      const level = Math.max(1, block.level ?? 1)
      const tag = block.listItem === 'number' ? 'ol' : 'ul'
      lists = lists.slice(0, level)
      while (lists.length < level || lists[level - 1]!.tag !== tag) {
        if (lists.length >= level) lists = lists.slice(0, level - 1)
        const list: Extract<RichTextNode, { type: 'element' }> = { type: 'element', tag, children: [] }
        const parent = lists.at(-1)
        if (parent) {
          const lastItem = parent.children.at(-1)
          if (lastItem?.type === 'element') lastItem.children.push(list)
          else parent.children.push({ type: 'element', tag: 'li', children: [list] })
        }
        else nodes.push(list)
        lists.push(list)
      }
      lists[level - 1]!.children.push({ type: 'element', tag: 'li', children: inline(block) })
      continue
    }
    lists = []

    if (raw._type === 'block') {
      const block = raw as PtBlock
      const style = (STYLES as readonly string[]).includes(block.style ?? 'normal') ? block.style ?? 'normal' : 'normal'
      const children = inline(block)
      if (style === 'blockquote') {
        // consecutive quote blocks are paragraphs of one <blockquote>
        if (!quote) nodes.push(quote = { type: 'element', tag: 'blockquote', children: [] })
        quote.children.push({ type: 'element', tag: 'p', children })
        continue
      }
      quote = undefined
      if (style === 'normal') {
        if (children.length) nodes.push({ type: 'element', tag: 'p', children })
      }
      else nodes.push({ type: 'element', tag: style as RichTextTag, attrs: { id: headingId(slugger, plain(block)) }, children })
      continue
    }
    quote = undefined

    if (raw._type === 'image') {
      const img = raw as PtImage
      if (!img.src) continue
      const image: Image = { src: img.src, alt: img.alt ?? '', width: img.width, height: img.height }
      nodes.push({ type: 'image', image, ...(img.caption ? { caption: img.caption } : {}) })
    }
    else if (raw._type === 'videoEmbed') {
      const v = raw as PtVideo
      const video = parseVideoUrl(v.url)
      if (!video) continue
      nodes.push({ type: 'video', ...video, title: v.title ?? '', ...(v.caption ? { caption: v.caption } : {}) })
    }
    // unknown block types are skipped
  }
  return { nodes }
}

// ---------------------------------------------------------------------------
// RichText -> Portable Text (used by the Sanity seed script)
// ---------------------------------------------------------------------------

export interface ToPortableTextOptions {
  /** Builds the stored image object (asset reference or import directive). */
  image: (image: Image, caption?: string) => Record<string, unknown>
  key: () => string
}

export function richTextToPortableText(body: RichText, opts: ToPortableTextOptions): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = []

  function spans(nodes: RichTextNode[], marks: string[], markDefs: PtLink[], into: PtSpan[]) {
    for (const n of nodes) {
      if (n.type === 'text') into.push({ _type: 'span', _key: opts.key(), text: n.value, marks })
      else if (n.type === 'element' && isDecorator(n.tag)) spans(n.children, [...marks, n.tag], markDefs, into)
      else if (n.type === 'element' && n.tag === 'a') {
        const def: PtLink = { _type: 'link', _key: opts.key(), href: n.attrs!.href! }
        markDefs.push(def)
        spans(n.children, [...marks, def._key], markDefs, into)
      }
      else if (n.type === 'element' && n.tag === 'br') into.push({ _type: 'span', _key: opts.key(), text: '\n', marks })
      else throw new Error(`Inline ${n.type === 'element' ? `<${n.tag}>` : n.type} is not supported in Portable Text`)
    }
  }

  function block(children: RichTextNode[], extra: Partial<PtBlock>) {
    const markDefs: PtLink[] = []
    const kids: PtSpan[] = []
    spans(children, [], markDefs, kids)
    out.push({ _type: 'block', _key: opts.key(), style: 'normal', ...extra, markDefs, children: kids })
  }

  function list(n: Extract<RichTextNode, { type: 'element' }>, level: number) {
    const listItem = n.tag === 'ol' ? 'number' : 'bullet'
    for (const li of n.children) {
      if (li.type !== 'element' || li.tag !== 'li') throw new Error('Lists may only contain <li>')
      const nested = li.children.filter(c => c.type === 'element' && (c.tag === 'ul' || c.tag === 'ol'))
      const own = li.children.filter(c => !nested.includes(c))
      block(own, { listItem, level })
      for (const sub of nested) list(sub as Extract<RichTextNode, { type: 'element' }>, level + 1)
    }
  }

  for (const n of body.nodes) {
    if (n.type === 'image') out.push({ _key: opts.key(), ...opts.image(n.image, n.caption) })
    else if (n.type === 'video') {
      out.push({ _type: 'videoEmbed', _key: opts.key(), url: videoUrl(n.provider, n.id), title: n.title, ...(n.caption ? { caption: n.caption } : {}) })
    }
    else if (n.type === 'text') {
      if (n.value.trim()) block([n], {})
    }
    else if (n.tag === 'p') block(n.children, {})
    else if (n.tag === 'h2' || n.tag === 'h3' || n.tag === 'h4') block(n.children, { style: n.tag })
    else if (n.tag === 'blockquote') {
      for (const p of n.children) {
        if (p.type === 'element' && p.tag === 'p') block(p.children, { style: 'blockquote' })
        else block([p], { style: 'blockquote' })
      }
    }
    else if (n.tag === 'ul' || n.tag === 'ol') list(n, 1)
    else throw new Error(`<${n.tag}> is not supported by the Sanity rich text schema`)
  }
  return out
}
