import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { allStaticUrls } from '../support/routes'

const urls = [...allStaticUrls, '/pagina-que-nao-existe', '/en/missing-page']

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
