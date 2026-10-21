import { expect, test, type Page } from '../support/test'

/** The test build uses ANALYTICS_PROVIDER=plausible (pnpm generate:test). */
function trackAnalytics(page: Page) {
  const hits: string[] = []
  page.on('request', (r) => {
    if (r.url().includes('plausible.io') || r.url().includes('googletagmanager')) hits.push(r.url())
  })
  page.route(/plausible\.io/, route => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }))
  return hits
}

test('banner shows on first visit and nothing loads before a choice', async ({ page }) => {
  const hits = trackAnalytics(page)
  await page.goto('/')
  const banner = page.getByRole('region', { name: 'Sua privacidade' })
  await expect(banner).toBeVisible()
  await expect(banner.getByRole('button', { name: 'Rejeitar opcionais' })).toBeVisible()
  await expect(banner.getByRole('button', { name: 'Aceitar todos' })).toBeVisible()
  // WhatsApp button stays out of the way while the banner is open
  await expect(page.locator('[data-whatsapp-button]')).toBeHidden()
  await page.waitForTimeout(500)
  expect(hits).toEqual([])
})

test('rejecting hides the banner, persists, and never loads analytics', async ({ page }) => {
  const hits = trackAnalytics(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Rejeitar opcionais' }).click()
  await expect(page.locator('[data-consent-banner]')).toHaveCount(0)
  await expect(page.locator('[data-whatsapp-button]')).toBeVisible()
  await page.reload()
  await page.waitForTimeout(500)
  await expect(page.locator('[data-consent-banner]')).toHaveCount(0)
  expect(hits).toEqual([])
})

test('accepting loads analytics; preferences reopen from the footer', async ({ page }) => {
  const hits = trackAnalytics(page)
  await page.goto('/en')
  await page.getByRole('button', { name: 'Accept all' }).click()
  await expect.poll(() => hits.length).toBeGreaterThan(0)

  await page.getByRole('button', { name: 'Cookie preferences' }).click()
  const dialog = page.getByRole('dialog', { name: 'Cookie preferences' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('checkbox', { name: 'Analytics' })).toBeChecked()
  await expect(dialog.getByRole('checkbox', { name: 'Essential' })).toBeDisabled()

  // Revoking reloads the page without analytics
  await dialog.getByRole('checkbox', { name: 'Analytics' }).uncheck()
  hits.length = 0
  await Promise.all([page.waitForEvent('load'), dialog.getByRole('button', { name: 'Save preferences' }).click()])
  await page.waitForTimeout(500)
  expect(hits).toEqual([])
})

test('customize opens preferences with analytics off by default', async ({ page }) => {
  const hits = trackAnalytics(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Personalizar' }).click()
  const dialog = page.getByRole('dialog', { name: 'Preferências de cookies' })
  await expect(dialog.getByRole('checkbox', { name: 'Estatística' })).not.toBeChecked()
  await dialog.getByRole('button', { name: 'Salvar preferências' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.locator('[data-consent-banner]')).toHaveCount(0)
  expect(hits).toEqual([])
})

test('the banner is in the static HTML: no late pop-in, no flash for returning visitors', async ({ browser }) => {
  // First visit, before any JavaScript ran: the head script already shows it.
  const fresh = await browser.newPage()
  await fresh.route(/\/_nuxt\/.*\.js$/, route => route.abort())
  await fresh.goto('/')
  await expect(fresh.locator('[data-consent-banner]')).toBeVisible()
  await fresh.close()

  // Returning visitor: hidden from the first paint, even before hydration.
  const returning = await browser.newPage()
  await returning.addInitScript(() => localStorage.setItem('site-consent', JSON.stringify({ version: 1, analytics: false, decidedAt: '2026-01-01T00:00:00.000Z' })))
  await returning.route(/\/_nuxt\/.*\.js$/, route => route.abort())
  await returning.goto('/')
  await expect(returning.locator('[data-consent-banner]')).toBeHidden()
  await returning.close()
})

test('without JavaScript the banner stays hidden (its buttons could not work)', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.locator('[data-consent-banner]')).toBeHidden()
  await context.close()
})
