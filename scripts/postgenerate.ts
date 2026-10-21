/**
 * Runs after `nuxt generate`:
 *  1. Copies the prerendered localized not-found pages to the 404.html files
 *     that Cloudflare Pages / Netlify serve for missing URLs.
 *  2. Builds the Pagefind search index. Pagefind reads <html lang> and writes
 *     one index per language, so results always match the visitor's locale.
 *     Only elements marked `data-pagefind-body` are indexed.
 */
import { access, copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import * as pagefind from 'pagefind'

const out = join(process.cwd(), '.output/public')

const notFound: Array<[string, string]> = [
  ['404/index.html', '404.html'],
  ['en/404/index.html', 'en/404.html'],
]

for (const [from, to] of notFound) {
  const src = join(out, from)
  await access(src)
  await copyFile(src, join(out, to))
  console.log(`[postgenerate] ${from} → ${to}`)
}

const { index, errors } = await pagefind.createIndex({})
if (!index) throw new Error(`[postgenerate] Pagefind failed: ${errors.join(', ')}`)
const added = await index.addDirectory({ path: out })
if (added.errors.length) throw new Error(`[postgenerate] Pagefind: ${added.errors.join(', ')}`)
const written = await index.writeFiles({ outputPath: join(out, 'pagefind') })
if (written.errors.length) throw new Error(`[postgenerate] Pagefind: ${written.errors.join(', ')}`)
await pagefind.close()
console.log(`[postgenerate] Pagefind indexed ${added.page_count} pages`)
