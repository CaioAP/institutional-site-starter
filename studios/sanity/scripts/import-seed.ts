/**
 * Imports seed/content.ndjson into the configured dataset (replaces documents
 * with the same ids). Needs `sanity login` and SANITY_STUDIO_PROJECT_ID.
 * Image/file paths in the seed are relative to the repository root; the
 * Sanity CLI needs absolute file URLs, so a resolved copy is imported.
 *
 *   pnpm seed:sanity:import            # dataset from SANITY_STUDIO_DATASET (production)
 *   pnpm seed:sanity:import staging    # another dataset
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url))
const dataset = process.argv[2] || process.env.SANITY_STUDIO_DATASET || 'production'
if (!process.env.SANITY_STUDIO_PROJECT_ID) {
  console.error('Set SANITY_STUDIO_PROJECT_ID (studios/sanity/.env) to your project id first. See studios/sanity/README.md.')
  process.exit(1)
}

const seed = readFileSync(new URL('../seed/content.ndjson', import.meta.url), 'utf8')
  .replace(/"(image|file)@file:\/\/\.\/([^"]+)"/g, (_, kind: string, path: string) => `"${kind}@${pathToFileURL(join(repoRoot, path)).href}"`)
const file = join(mkdtempSync(join(tmpdir(), 'sanity-seed-')), 'content.ndjson')
writeFileSync(file, seed)

execFileSync('sanity', ['dataset', 'import', file, dataset, '--replace'], { stdio: 'inherit' })
