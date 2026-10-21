import { expect, test } from '@playwright/test'
import { staticPages } from '../support/routes'

test.describe('pages render in both locales', () => {
  for (const { pt, en } of staticPages) {
    test(`${pt} and ${en}`, async ({ page }) => {
      await page.goto(pt)
      await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
      await expect(page.locator('h1')).toHaveCount(1)

      await page.goto(en)
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await expect(page.locator('h1')).toHaveCount(1)
    })
  }
})

test('language switcher goes to the translated page', async ({ page, isMobile }) => {
  await page.goto('/sobre')
  if (isMobile) await page.getByRole('button', { name: 'Abrir menu' }).click()
  await page.getByRole('link', { name: 'English', exact: true }).first().click()
  await expect(page).toHaveURL(/\/en\/about$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About')
})

test('skip link is first in tab order and moves focus to main', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium')
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
})

test('focus moves to main content after client-side navigation', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop nav')
  await page.goto('/')
  await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Equipe' }).click()
  await expect(page).toHaveURL(/\/equipe$/)
  await expect(page.locator('#main')).toBeFocused()
  await expect(page.locator('.nuxt-route-announcer')).toContainText('Equipe')
})

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('traps focus, closes on Escape and returns focus', async ({ page }) => {
    await page.goto('/')
    const trigger = page.getByRole('button', { name: 'Abrir menu' })
    await trigger.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Fechar menu' })).toBeFocused()

    // Tab through more items than the dialog has; focus must stay inside.
    for (let i = 0; i < 12; i++) await page.keyboard.press('Tab')
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })
})

test('missing pages show a localized 404', async ({ page }) => {
  const pt = await page.goto('/nao-existe')
  expect(pt?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página não encontrada')

  const en = await page.goto('/en/does-not-exist')
  expect(en?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found')
})
