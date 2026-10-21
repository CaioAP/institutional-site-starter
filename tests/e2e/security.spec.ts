import { expect, test } from '@playwright/test'

/**
 * The generated `_headers` (lib/deploy/headers.ts) as served by the local
 * static server, which applies it the way Cloudflare Pages and Netlify do.
 * The shared fixture in tests/support/test.ts separately fails any test that
 * triggers a CSP violation, so the policy is known to allow the whole site.
 */

test.skip(({ isMobile }) => isMobile, 'viewport independent')

test('pages are served with security headers', async ({ request }) => {
  const res = await request.get('/en/blog')
  const h = res.headers()
  expect(h['content-security-policy']).toContain('default-src \'self\'')
  expect(h['content-security-policy']).toContain('frame-ancestors \'none\'')
  expect(h['content-security-policy']).not.toContain('\'unsafe-inline\' \'unsafe-eval\'')
  expect(h['x-content-type-options']).toBe('nosniff')
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin')
})

test('build assets are cached forever, image variants for a week', async ({ request }) => {
  const html = await (await request.get('/')).text()
  const script = html.match(/src="(\/_nuxt\/[^"]+\.js)"/)![1]!
  expect((await request.get(script)).headers()['cache-control']).toContain('immutable')
  const image = html.match(/(\/_ipx\/[^" ]+)/)![1]!.replace(/&amp;/g, '&')
  expect((await request.get(image)).headers()['cache-control']).toBe('public, max-age=604800')
})

test('the CSP blocks scripts from hosts it does not list', async ({ page }) => {
  const violations: string[] = []
  page.on('console', msg => /Content Security Policy/i.test(msg.text()) && violations.push(msg.text()))
  await page.goto('/')
  await page.evaluate(() => {
    const s = document.createElement('script')
    s.src = 'https://untrusted.example/script.js'
    document.head.appendChild(s)
  })
  await expect.poll(() => violations.length).toBeGreaterThan(0)
})
