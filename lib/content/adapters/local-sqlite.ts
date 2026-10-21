/**
 * Reads the local content outside Nuxt, straight from the database Nuxt
 * Content writes on every build (.data/content/contents.sqlite). Used by the
 * Sanity seed script and the source parity test. Node-only.
 */
import { access } from 'node:fs/promises'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { LocalCollections, LocalStore } from './local'

export const LOCAL_CONTENT_DB = '.data/content/contents.sqlite'

/** Columns stored as JSON text. */
const JSON_COLUMNS = new Set(['address', 'contact', 'socials', 'seo', 'sections', 'body', 'team', 'areas', 'photo', 'cover', 'tags', 'meta'])

export async function readLocalContent(root = process.cwd()): Promise<LocalStore> {
  const file = join(root, LOCAL_CONTENT_DB)
  await access(file).catch(() => {
    throw new Error(`${LOCAL_CONTENT_DB} not found. Run \`pnpm generate\` (or \`pnpm dev\` once) to build it.`)
  })
  const db = new DatabaseSync(file, { readOnly: true })
  return {
    async all<K extends keyof LocalCollections>(collection: K, locale: string) {
      const rows = db.prepare(`SELECT * FROM _content_${collection} WHERE stem LIKE ? ORDER BY stem`).all(`${locale}/%`)
      return rows.map(row => Object.fromEntries(
        Object.entries(row)
          .filter(([k, v]) => v !== null && k !== '__hash__')
          .map(([k, v]) => [k, JSON_COLUMNS.has(k) && typeof v === 'string' ? JSON.parse(v) : v]),
      )) as unknown as Array<LocalCollections[K]>
    },
  }
}
