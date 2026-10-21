/**
 * Minimal static server for the generated site, used by Playwright and
 * Lighthouse CI. Mimics Cloudflare Pages / Netlify: serves `dir/index.html`
 * for `/dir`, and the nearest `404.html` (e.g. /en/404.html) for missing paths.
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, sep } from 'node:path'

const root = join(process.cwd(), process.argv[2] ?? '.output/public')
const port = Number(process.env.PORT ?? 4173)

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml', '.ico': 'image/x-icon',
  '.pf_meta': 'application/octet-stream', '.pagefind': 'application/octet-stream', '.wasm': 'application/wasm',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
}

async function isFile(p: string) {
  try {
    return (await stat(p)).isFile()
  }
  catch {
    return false
  }
}

async function resolveFile(urlPath: string): Promise<{ file: string, status: number }> {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.(\/|\\|$))+/, '')
  const base = join(root, safe)
  if (!base.startsWith(root)) return { file: join(root, '404.html'), status: 404 }
  for (const candidate of [base, join(base, 'index.html'), `${base}.html`]) {
    if (await isFile(candidate)) return { file: candidate, status: 200 }
  }
  // Walk up to the nearest 404.html
  const parts = safe.split(sep).filter(Boolean)
  while (parts.length) {
    parts.pop()
    const nf = join(root, ...parts, '404.html')
    if (await isFile(nf)) return { file: nf, status: 404 }
  }
  return { file: join(root, '404.html'), status: 404 }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const { file, status } = await resolveFile(url.pathname)
  try {
    const body = await readFile(file)
    res.writeHead(status, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
    res.end(body)
  }
  catch {
    res.writeHead(404).end('Not found')
  }
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`))
