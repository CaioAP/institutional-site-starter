/**
 * Thin wrapper around Pagefind's browser API (/pagefind/pagefind.js, built by
 * scripts/postgenerate.ts). Pagefind picks the index matching <html lang>, so
 * results are always in the current locale.
 */
export type SearchResultType = 'page' | 'area' | 'team' | 'post'

export interface SearchResult {
  url: string
  title: string
  /** Excerpt split into plain and highlighted parts (rendered without v-html) */
  excerpt: ExcerptPart[]
  type: SearchResultType
}

interface PagefindResultData {
  url: string
  excerpt: string
  meta: Record<string, string | undefined>
}
interface PagefindApi {
  options(opts: Record<string, unknown>): Promise<void>
  init(): Promise<void>
  destroy?(): Promise<void>
  debouncedSearch(term: string, opts?: Record<string, unknown>, ms?: number): Promise<{ results: Array<{ data(): Promise<PagefindResultData> }> } | null>
}

let api: Promise<PagefindApi> | null = null
let apiLang: string | null = null

async function loadPagefind(): Promise<PagefindApi> {
  const lang = document.documentElement.lang
  if (api && apiLang !== lang) {
    await (await api).destroy?.()
    api = null
  }
  if (!api) {
    apiLang = lang
    const url = `${useRuntimeConfig().app.baseURL.replace(/\/$/, '')}/pagefind/pagefind.js`
    api = import(/* @vite-ignore */ url).then(async (m: PagefindApi) => {
      await m.options({ excerptLength: 24 })
      await m.init()
      return m
    })
    api.catch(() => (api = null))
  }
  return api
}

const TYPES: SearchResultType[] = ['page', 'area', 'team', 'post']

export interface ExcerptPart { text: string, mark: boolean }

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': '\'', '&#x27;': '\'' }

/** Turns Pagefind's excerpt HTML into text parts; only <mark> survives, as a flag. */
export function parseExcerpt(html: string): ExcerptPart[] {
  return html
    .split(/(<mark>|<\/mark>)/)
    .reduce<{ parts: ExcerptPart[], mark: boolean }>((acc, chunk) => {
      if (chunk === '<mark>') acc.mark = true
      else if (chunk === '</mark>') acc.mark = false
      else if (chunk) {
        const text = chunk.replace(/<[^>]*>/g, '').replace(/&(amp|lt|gt|quot|#39|#x27);/g, e => ENTITIES[e] ?? e)
        if (text) acc.parts.push({ text, mark: acc.mark })
      }
      return acc
    }, { parts: [], mark: false })
    .parts
}

/** "/en/blog/x/" or "/en/blog/x/index.html" → "/en/blog/x" */
export function cleanUrl(url: string) {
  const u = url.replace(/index\.html$/, '').replace(/\/$/, '')
  return u || '/'
}

export function useSearch() {
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const status = ref<'idle' | 'loading' | 'done' | 'unavailable'>('idle')

  async function run(term: string) {
    const q = term.trim()
    if (!q) {
      results.value = []
      status.value = 'idle'
      return
    }
    status.value = 'loading'
    try {
      const pf = await loadPagefind()
      const search = await pf.debouncedSearch(q, {}, 200)
      if (!search) return // superseded by a newer keystroke
      const data = await Promise.all(search.results.slice(0, 20).map(r => r.data()))
      results.value = data.map(d => ({
        url: cleanUrl(d.url),
        title: d.meta.title ?? d.url,
        excerpt: parseExcerpt(d.excerpt),
        type: TYPES.includes(d.meta.type as SearchResultType) ? d.meta.type as SearchResultType : 'page',
      }))
      status.value = 'done'
    }
    catch {
      results.value = []
      status.value = 'unavailable'
    }
  }

  watch(query, q => run(q))
  return { query, results, status, run }
}
