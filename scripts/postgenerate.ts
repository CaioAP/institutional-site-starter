/**
 * Runs after `nuxt generate`:
 *  1. Checks the localized not-found pages exist where Cloudflare Pages and
 *     Netlify look for them (404.html, en/404.html).
 *  2. Builds the Pagefind search index. Pagefind reads <html lang> and writes
 *     one index per language, so results always match the visitor's locale.
 *     Only elements marked `data-pagefind-body` are indexed.
 *  3. Writes `_headers` (security + cache headers, read by Cloudflare Pages
 *     and Netlify). The CSP allows inline scripts and inline event handlers
 *     by hash, so the hashes are collected from the generated HTML.
 */
import { createHash } from 'node:crypto'
import { access, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import * as pagefind from 'pagefind'
import { readBuildEnv } from '../lib/deploy/env.ts'
import { formatHeadersFile, headerRules } from '../lib/deploy/headers.ts'

const out = join(process.cwd(), '.output/public')

// The /404 routes prerender straight to these files (autoSubfolderIndex: false).
for (const file of ['404.html', 'en/404.html']) {
  await access(join(out, file)).catch(() => {
    throw new Error(`[postgenerate] Missing ${file}: is the 404 route still prerendered?`)
  })
}

const { index, errors } = await pagefind.createIndex({})
if (!index) throw new Error(`[postgenerate] Pagefind failed: ${errors.join(', ')}`)
const added = await index.addDirectory({ path: out })
if (added.errors.length) throw new Error(`[postgenerate] Pagefind: ${added.errors.join(', ')}`)
const written = await index.writeFiles({ outputPath: join(out, 'pagefind') })
if (written.errors.length) throw new Error(`[postgenerate] Pagefind: ${written.errors.join(', ')}`)
await pagefind.close()
console.log(`[postgenerate] Pagefind indexed ${added.page_count} pages`)

const sha256 = (code: string) => `sha256-${createHash('sha256').update(code).digest('base64')}`

const decodeAttr = (value: string) => value
  .replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

/**
 * sha256 of every executable inline script (data scripts like JSON-LD don't
 * need one) and of every inline event handler attribute (`onerror="…"`).
 */
async function inlineHashes(dir: string) {
  const scripts = new Set<string>()
  const handlers = new Set<string>()
  const files = (await readdir(dir, { recursive: true })).filter(f => f.endsWith('.html'))
  for (const file of files) {
    const html = await readFile(join(dir, file), 'utf8')
    for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (!body || /\bsrc=/.test(attrs!)) continue
      const type = attrs!.match(/\btype="([^"]*)"/)?.[1]
      if (type && type !== 'module' && type !== 'importmap' && type !== 'text/javascript') continue
      scripts.add(sha256(body))
    }
    for (const [tag] of html.matchAll(/<[a-z][^\s>]*\s[^>]*>/gi)) {
      for (const [, code] of tag.matchAll(/\son[a-z]+="([^"]*)"/g)) handlers.add(sha256(decodeAttr(code!)))
    }
  }
  return { scripts: [...scripts], handlers: [...handlers] }
}

const env = readBuildEnv()
const { scripts, handlers } = await inlineHashes(out)
await writeFile(join(out, '_headers'), formatHeadersFile(headerRules(env, scripts, handlers)))
console.log(`[postgenerate] _headers written (${env.siteEnv}, ${scripts.length} inline script and ${handlers.length} event handler hashes)`)
