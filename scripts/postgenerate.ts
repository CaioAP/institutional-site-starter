/**
 * Runs after `nuxt generate`:
 *  1. Copies the prerendered localized not-found pages to the 404.html files
 *     that Cloudflare Pages / Netlify serve for missing URLs.
 * (Pagefind indexing is added to this step in the search milestone.)
 */
import { copyFile, access } from 'node:fs/promises'
import { join } from 'node:path'

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
