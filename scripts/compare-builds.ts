/**
 * Compares the rendered HTML of two static builds, e.g. the site built from
 * local content and from the Sanity seed. Scripts (Nuxt payloads hold raw
 * data), hashed asset names and build ids are ignored; everything a visitor or
 * crawler sees must match.
 *
 * Usage: node scripts/compare-builds.ts <dirA> <dirB>
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const [a, b] = process.argv.slice(2)
if (!a || !b) {
  console.error('Usage: node scripts/compare-builds.ts <dirA> <dirB>')
  process.exit(2)
}

const htmlFiles = async (dir: string) =>
  (await readdir(dir, { recursive: true })).filter(f => f.endsWith('.html') && !f.startsWith('_ipx')).sort()

const normalize = (html: string) => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
  .replace(/\/_nuxt\/[^"' )]+/g, '/_nuxt/*')
  .replace(/_b=[\w-]+/g, '_b=*')

const [filesA, filesB] = await Promise.all([htmlFiles(a), htmlFiles(b)])
const problems: string[] = []
for (const f of filesA.filter(f => !filesB.includes(f))) problems.push(`only in ${a}: ${f}`)
for (const f of filesB.filter(f => !filesA.includes(f))) problems.push(`only in ${b}: ${f}`)

for (const file of filesA.filter(f => filesB.includes(f))) {
  const [x, y] = await Promise.all([readFile(join(a, file), 'utf8'), readFile(join(b, file), 'utf8')].map(p => p.then(normalize)))
  if (x === y) continue
  let i = 0
  while (x[i] === y[i]) i++
  problems.push(`${file} differs:\n  ${a}: …${x.slice(Math.max(0, i - 80), i + 120)}…\n  ${b}: …${y.slice(Math.max(0, i - 80), i + 120)}…`)
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`${filesA.length} pages render identically.`)
