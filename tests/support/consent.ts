import type { Page } from '@playwright/test'

/** Pre-sets a consent decision so the banner doesn't cover the page. */
export async function withConsent(page: Page, analytics = false) {
  await page.addInitScript((a) => {
    localStorage.setItem('site-consent', JSON.stringify({ version: 1, analytics: a, decidedAt: new Date().toISOString() }))
  }, analytics)
}
