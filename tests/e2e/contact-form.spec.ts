import { expect, test } from '../support/test'
import { withConsent } from '../support/consent'

const ENDPOINT = 'https://forms.example.test/contact'

test.beforeEach(({ page }) => withConsent(page))

async function fillValid(page: import('@playwright/test').Page) {
  await page.getByLabel('Nome').fill('Maria Silva')
  await page.getByLabel('E-mail').fill('maria@example.com')
  await page.getByLabel('Assunto').fill('Consulta')
  await page.getByLabel('Mensagem').fill('Gostaria de agendar uma conversa.')
  await page.getByRole('checkbox', { name: /política de privacidade/ }).check()
}

test('shows accessible errors and focuses the first invalid field', async ({ page }) => {
  await page.goto('/contato')
  await page.getByRole('button', { name: 'Enviar mensagem' }).click()

  const name = page.getByLabel('Nome')
  await expect(name).toBeFocused()
  await expect(name).toHaveAttribute('aria-invalid', 'true')
  await expect(name).toHaveAttribute('aria-describedby', 'contact-name-error')
  await expect(page.locator('#contact-name-error')).toHaveText('Preencha este campo.')
  await expect(page.locator('form [role="status"]')).toContainText('5 erros')

  // Errors clear as fields are fixed
  await name.fill('Maria')
  await expect(name).toHaveAttribute('aria-invalid', 'false')

  await page.getByLabel('E-mail').fill('maria@')
  await expect(page.locator('#contact-email-error')).toContainText('e-mail válido')
  // Optional phone keeps its hint and adds the error
  await page.getByLabel('Telefone').fill('12')
  await expect(page.getByLabel('Telefone')).toHaveAttribute('aria-describedby', 'contact-phone-hint contact-phone-error')
})

test('sends to the configured endpoint and announces success', async ({ page }) => {
  let body: Record<string, string> | null = null
  await page.route(ENDPOINT, async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({ status: 200, body: '{}' })
  })
  await page.goto('/contato')
  await fillValid(page)
  await page.getByRole('button', { name: 'Enviar mensagem' }).click()
  await expect(page.locator('form [role="status"]')).toHaveText('Mensagem enviada. Responderemos em até um dia útil.')
  expect(body).toMatchObject({ name: 'Maria Silva', email: 'maria@example.com', consent: 'yes' })
  expect(body).not.toHaveProperty('website')
  await expect(page.getByLabel('Nome')).toHaveValue('')
})

test('announces failures with a fallback email', async ({ page }) => {
  await page.route(ENDPOINT, route => route.fulfill({ status: 500 }))
  await page.goto('/en/contact')
  await page.getByLabel('Name').fill('Maria')
  await page.getByLabel('Email').fill('maria@example.com')
  await page.getByLabel('Subject').fill('Hello')
  await page.getByLabel('Message').fill('I would like to talk.')
  await page.getByRole('checkbox', { name: /privacy policy/ }).check()
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.locator('form [role="status"]')).toContainText('could not be sent')
  await expect(page.locator('form [role="status"]')).toContainText('contato@exemplo.com.br')
})

test('honeypot submissions are dropped silently', async ({ page }) => {
  let called = false
  await page.route(ENDPOINT, (route) => {
    called = true
    return route.fulfill({ status: 200, body: '{}' })
  })
  await page.goto('/contato')
  await fillValid(page)
  await page.locator('#contact-website').fill('http://spam.example', { force: true })
  await page.getByRole('button', { name: 'Enviar mensagem' }).click()
  await expect(page.locator('form [role="status"]')).toContainText('Mensagem enviada')
  expect(called).toBe(false)
})
