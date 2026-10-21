/**
 * Contact form: field model, validation and the provider adapters.
 * Framework-free so it can be unit-tested and reused (e.g. a newsletter form).
 */

export interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  consent: boolean
  /** Honeypot: hidden from people, bots fill it in */
  website: string
}

export type ContactField = Exclude<keyof ContactForm, 'website'>
/** i18n keys under `form.errors` */
export type FieldError = 'required' | 'email' | 'phone' | 'tooShort' | 'consent'
export type ContactErrors = Partial<Record<ContactField, FieldError>>

export const CONTACT_FIELDS: ContactField[] = ['name', 'email', 'phone', 'subject', 'message', 'consent']
export const MESSAGE_MIN_LENGTH = 10

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
/** Digits, spaces, +, -, (, ) with 8–15 digits overall (optional field) */
const PHONE = /^\+?[\d\s()-]+$/

export function emptyContactForm(): ContactForm {
  return { name: '', email: '', phone: '', subject: '', message: '', consent: false, website: '' }
}

export function validateContact(form: ContactForm): ContactErrors {
  const errors: ContactErrors = {}
  if (!form.name.trim()) errors.name = 'required'
  if (!form.email.trim()) errors.email = 'required'
  else if (!EMAIL.test(form.email.trim())) errors.email = 'email'
  const digits = form.phone.replace(/\D/g, '')
  if (form.phone.trim() && (!PHONE.test(form.phone.trim()) || digits.length < 8 || digits.length > 15)) errors.phone = 'phone'
  if (!form.subject.trim()) errors.subject = 'required'
  if (!form.message.trim()) errors.message = 'required'
  else if (form.message.trim().length < MESSAGE_MIN_LENGTH) errors.message = 'tooShort'
  if (!form.consent) errors.consent = 'consent'
  return errors
}

export function isSpam(form: ContactForm) {
  return form.website.trim() !== ''
}

// ---------------------------------------------------------------------------
// Providers (FORM_PROVIDER)
// ---------------------------------------------------------------------------

export const FORM_PROVIDERS = ['netlify', 'endpoint'] as const
export type FormProvider = (typeof FORM_PROVIDERS)[number]

export interface SubmitOptions {
  provider: FormProvider
  /** FORM_ENDPOINT, required for `endpoint` (e.g. Formspree, a Cloudflare Worker) */
  endpoint?: string
  /** Netlify form name; must match the `name` attribute on the rendered <form> */
  formName?: string
  fetch?: typeof globalThis.fetch
}

/** Strips the honeypot and normalizes whitespace. */
export function toPayload(form: ContactForm) {
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    subject: form.subject.trim(),
    message: form.message.trim(),
    consent: form.consent ? 'yes' : 'no',
  }
}

export async function submitContact(form: ContactForm, opts: SubmitOptions): Promise<void> {
  const doFetch = opts.fetch ?? globalThis.fetch
  const payload = toPayload(form)

  if (opts.provider === 'netlify') {
    // Netlify Forms: urlencoded POST to any static path, with form-name.
    const body = new URLSearchParams({ 'form-name': opts.formName ?? 'contact', ...payload })
    const res = await doFetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    if (!res.ok) throw new Error(`Form submission failed (${res.status})`)
    return
  }

  if (!opts.endpoint) throw new Error('FORM_ENDPOINT is not configured')
  const res = await doFetch(opts.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Form submission failed (${res.status})`)
}
