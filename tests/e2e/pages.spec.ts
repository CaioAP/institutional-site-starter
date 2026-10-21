import { expect, test } from '../support/test'
import { detailPages } from '../support/routes'

test.describe('detail pages', () => {
  for (const { pt, en } of detailPages) {
    test(`${pt} switches language to ${en} and back`, async ({ page, isMobile }) => {
      await page.goto(pt)
      await expect(page.locator('h1')).toHaveCount(1)
      if (isMobile) await page.getByRole('button', { name: 'Abrir menu' }).click()
      await page.getByRole('link', { name: 'English', exact: true }).first().click()
      await expect(page).toHaveURL(new RegExp(`${en}$`))
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')

      if (isMobile) await page.getByRole('button', { name: 'Open menu' }).click()
      await page.getByRole('link', { name: 'Português', exact: true }).first().click()
      await expect(page).toHaveURL(new RegExp(`${pt}$`))
    })
  }

  test('detail pages have breadcrumbs with structured data', async ({ page }) => {
    await page.goto('/blog/lgpd-para-pequenas-empresas')
    const crumbs = page.getByRole('navigation', { name: 'Você está em' })
    await expect(crumbs.getByRole('link', { name: 'Blog' })).toBeVisible()
    await expect(crumbs.locator('[aria-current="page"]')).toContainText('LGPD')
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(ld.some(s => s.includes('BreadcrumbList'))).toBe(true)
  })
})

test('home renders content-driven sections', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Advocacia clara')
  for (const heading of ['Áreas de atuação', 'Nossa equipe', 'Artigos recentes', 'Venha nos visitar']) {
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible()
  }
  await expect(page.locator('main').getByRole('link', { name: 'Direito Tributário' })).toBeVisible()
})

test('blog filters by category and links back to all posts', async ({ page }) => {
  await page.goto('/blog')
  const filter = page.getByRole('navigation', { name: 'Categorias' })
  await expect(filter.getByRole('link', { name: 'Todos' })).toHaveAttribute('aria-current', 'page')
  await filter.getByRole('link', { name: 'Trabalho' }).click()
  await expect(page).toHaveURL(/\/blog\/categoria\/trabalho$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Artigos sobre Trabalho')
  await expect(page.locator('main article')).toHaveCount(1)
})

test('post page shows reading time, author, related posts and a click-to-load video', async ({ page }) => {
  await page.goto('/blog/lgpd-para-pequenas-empresas')
  await expect(page.getByText(/min de leitura/).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Sobre o autor' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Leia também' })).toBeVisible()

  // No third-party request before the click.
  await expect(page.locator('iframe')).toHaveCount(0)
  await page.getByRole('button', { name: /Reproduzir vídeo/ }).click()
  const frame = page.locator('iframe')
  await expect(frame).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/aqz-KE-bpKQ/)
  await expect(frame).toBeFocused()
})

test('no broken internal links (every linked page was prerendered)', async ({ request }) => {
  const seen = new Set<string>()
  // Search pages are reached through the search dialog, not a link.
  const queue = ['/', '/en', '/busca', '/en/search']
  while (queue.length) {
    const path = queue.shift()!
    if (seen.has(path)) continue
    seen.add(path)
    const res = await request.get(path)
    expect(res.status(), `${path} should exist`).toBe(200)
    const html = await res.text()
    for (const [, href] of html.matchAll(/<a[^>]+href="(\/[^"#?]*)"/g)) {
      if (!href!.startsWith('/_') && !seen.has(href!)) queue.push(href!)
    }
  }
  expect(seen.size).toBeGreaterThanOrEqual(50)
})
