import { test as base, expect } from '@playwright/test'

/**
 * Playwright `test` whose `page.goto` also waits for hydration
 * (app/plugins/hydrated.client.ts): the static HTML is visible right away, but
 * menus, dialogs and the consent banner only respond once Vue has hydrated.
 *
 * Every test also fails on a Content-Security-Policy violation: the static
 * server applies the generated `_headers`, so this proves the CSP allows
 * everything the site does (search, embeds, analytics, the form endpoint).
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const violations: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && /Content Security Policy/i.test(msg.text())) violations.push(msg.text())
    })
    const goto = page.goto.bind(page)
    page.goto = async (url, options) => {
      const response = await goto(url, options)
      await page.locator('html[data-hydrated]').waitFor({ state: 'attached' })
      return response
    }
    await use(page)
    expect(violations, 'CSP violations').toEqual([])
  },
})

export { expect }
export type { Page } from '@playwright/test'
