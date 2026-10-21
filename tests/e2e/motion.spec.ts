import { expect, test } from '../support/test'
import { withConsent } from '../support/consent'

test.beforeEach(({ page }) => withConsent(page))

test('below-the-fold sections animate in when scrolled into view', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('main li').filter({ hasText: 'Proteção de Dados' }).first()
  await expect(card).toHaveClass(/reveal/)
  await expect(card).not.toHaveClass(/is-revealed/)
  await card.scrollIntoViewIfNeeded()
  await expect(card).toHaveClass(/is-revealed/)
})

test('prefers-reduced-motion disables entrance animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('.reveal')).toHaveCount(0)
  const card = page.locator('main li').filter({ hasText: 'Proteção de Dados' }).first()
  await expect(card).toBeVisible()
  expect(await card.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
})

test('content is visible without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/')
  const card = page.locator('main li').filter({ hasText: 'Proteção de Dados' }).first()
  expect(await card.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  await ctx.close()
})

test('WhatsApp button links to the configured number', async ({ page }) => {
  await page.goto('/')
  const button = page.getByRole('link', { name: /Conversar pelo WhatsApp/ })
  await expect(button).toHaveAttribute('href', /^https:\/\/wa\.me\/5511900000000\?text=/)
  await expect(button).toHaveAttribute('target', '_blank')
})
