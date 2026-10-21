import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '../support/test'
import { allDetailUrls, allStaticUrls } from '../support/routes'

const urls = [...allStaticUrls, ...allDetailUrls, '/pagina-que-nao-existe', '/en/missing-page']

for (const url of urls) {
  test(`no axe violations (WCAG 2.2 AA) on ${url}`, async ({ page }) => {
    await page.goto(url)
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze()
    const summary = results.violations.map(v => `${v.id}: ${v.help} → ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)
    expect(summary).toEqual([])
  })
}

test('no axe violations with the search and consent dialogs open', async ({ page }) => {
  await page.goto('/en')
  await page.getByRole('button', { name: 'Customize' }).click()
  await expect(page.getByRole('dialog', { name: 'Cookie preferences' })).toBeVisible()
  let results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.map(v => v.id)).toEqual([])
  await page.getByRole('button', { name: 'Reject optional' }).click()

  await page.locator('body').press('/')
  await page.getByRole('searchbox').fill('law')
  await expect(page.getByRole('dialog').getByRole('listitem').first()).toBeVisible()
  results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.map(v => v.id)).toEqual([])
})
