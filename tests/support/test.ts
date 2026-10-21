import { test as base, expect } from '@playwright/test'

/**
 * Playwright `test` whose `page.goto` also waits for hydration
 * (app/plugins/hydrated.client.ts): the static HTML is visible right away, but
 * menus, dialogs and the consent banner only respond once Vue has hydrated.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page)
    page.goto = async (url, options) => {
      const response = await goto(url, options)
      await page.locator('html[data-hydrated]').waitFor({ state: 'attached' })
      return response
    }
    await use(page)
  },
})

export { expect }
export type { Page } from '@playwright/test'
