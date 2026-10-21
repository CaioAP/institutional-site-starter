import { describe, expect, it, vi } from 'vitest'
import { emptyContactForm, isSpam, submitContact, validateContact, type ContactForm } from '../../lib/forms/contact'

const valid = (): ContactForm => ({
  ...emptyContactForm(),
  name: 'Maria', email: 'maria@example.com', phone: '+55 11 99999-0000',
  subject: 'Consulta', message: 'Gostaria de agendar uma reunião.', consent: true,
})

describe('validateContact', () => {
  it('accepts a valid form, phone optional', () => {
    expect(validateContact(valid())).toEqual({})
    expect(validateContact({ ...valid(), phone: '' })).toEqual({})
  })

  it('reports every problem', () => {
    expect(validateContact(emptyContactForm())).toEqual({
      name: 'required', email: 'required', subject: 'required', message: 'required', consent: 'consent',
    })
  })

  it('checks email, phone and message length', () => {
    const errors = validateContact({ ...valid(), email: 'maria@', phone: '12ab', message: 'oi' })
    expect(errors).toEqual({ email: 'email', phone: 'phone', message: 'tooShort' })
    expect(validateContact({ ...valid(), phone: '1234' }).phone).toBe('phone')
  })
})

describe('honeypot', () => {
  it('flags filled honeypot', () => {
    expect(isSpam({ ...valid(), website: 'http://spam' })).toBe(true)
    expect(isSpam(valid())).toBe(false)
  })
})

describe('submitContact', () => {
  it('posts urlencoded data with form-name to Netlify', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    await submitContact({ ...valid(), website: 'x' }, { provider: 'netlify', fetch })
    const [url, init] = fetch.mock.calls[0]!
    expect(url).toBe('/')
    const body = new URLSearchParams(init.body)
    expect(body.get('form-name')).toBe('contact')
    expect(body.get('email')).toBe('maria@example.com')
    expect(body.has('website')).toBe(false)
  })

  it('posts JSON to a custom endpoint', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    await submitContact(valid(), { provider: 'endpoint', endpoint: 'https://forms.example/x', fetch })
    const [url, init] = fetch.mock.calls[0]!
    expect(url).toBe('https://forms.example/x')
    expect(JSON.parse(init.body)).toMatchObject({ name: 'Maria', consent: 'yes' })
  })

  it('throws on errors and missing endpoint', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 500 }))
    await expect(submitContact(valid(), { provider: 'endpoint', endpoint: '/x', fetch })).rejects.toThrow('500')
    await expect(submitContact(valid(), { provider: 'endpoint', fetch })).rejects.toThrow('FORM_ENDPOINT')
  })
})
