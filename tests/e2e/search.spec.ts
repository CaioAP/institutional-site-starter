import { expect, test } from '../support/test'
import { withConsent } from '../support/consent'

test.beforeEach(({ page }) => withConsent(page))

test('"/" opens the search dialog and finds results in the current locale', async ({ page }) => {
  await page.goto('/')
  await page.locator('body').press('/')
  const dialog = page.getByRole('dialog', { name: 'Buscar no site' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('searchbox')).toBeFocused()

  await dialog.getByRole('searchbox').fill('LGPD')
  await expect(dialog.getByRole('status')).toContainText(/resultado/)
  const first = dialog.getByRole('listitem').filter({ hasText: 'LGPD para pequenas empresas' })
  await expect(first).toContainText('Artigo')
  // No English pages in Portuguese results
  await expect(dialog.getByText('LGPD for small businesses')).toHaveCount(0)

  await first.getByRole('link').click()
  await expect(page).toHaveURL(/\/blog\/lgpd-para-pequenas-empresas$/)
  await expect(dialog).toBeHidden()
})

test('Escape closes the dialog and returns focus to the trigger', async ({ page, isMobile }) => {
  test.skip(isMobile)
  await page.goto('/en')
  const trigger = page.getByRole('button', { name: 'Search' })
  await trigger.click()
  await expect(page.getByRole('dialog', { name: 'Search the site' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('full results page reads ?q= and labels result types in English', async ({ page }) => {
  await page.goto('/en/search?q=tax')
  await expect(page.getByRole('searchbox')).toHaveValue('tax')
  const results = page.locator('main li')
  await expect(results.filter({ hasText: 'Tax Law' }).first()).toContainText('Practice area')
  await expect(page.locator('main')).not.toContainText('Direito Tributário')
})

test('submitting the dialog goes to the full results page', async ({ page }) => {
  await page.goto('/')
  await page.locator('body').press('/')
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('searchbox').fill('contratos')
  await dialog.getByRole('button', { name: 'Buscar' }).click()
  await expect(page).toHaveURL(/\/busca\?q=contratos$/)
  await expect(page.locator('main li').first()).toBeVisible()
})
