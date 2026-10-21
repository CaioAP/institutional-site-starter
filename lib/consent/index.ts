/**
 * Cookie consent model (LGPD). Stored in localStorage under a versioned key;
 * bump CONSENT_VERSION when categories change so visitors are asked again.
 */
export const CONSENT_VERSION = 1
export const CONSENT_STORAGE_KEY = 'site-consent'

export interface ConsentChoice {
  version: number
  /** Analytics / statistics cookies and scripts */
  analytics: boolean
  /** ISO date of the decision, kept as proof of consent */
  decidedAt: string
}

export function parseConsent(raw: string | null | undefined): ConsentChoice | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<ConsentChoice>
    if (value.version !== CONSENT_VERSION || typeof value.analytics !== 'boolean' || typeof value.decidedAt !== 'string') return null
    return value as ConsentChoice
  }
  catch {
    return null
  }
}

export function makeConsent(analytics: boolean, now = new Date()): ConsentChoice {
  return { version: CONSENT_VERSION, analytics, decidedAt: now.toISOString() }
}

/**
 * Inline <head> script: marks <html data-consent="pending"> before first paint
 * when there is no valid stored decision. Must mirror parseConsent().
 */
export const CONSENT_HEAD_SCRIPT = `try{var c=JSON.parse(localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)}));if(!c||c.version!==${CONSENT_VERSION}||typeof c.analytics!=='boolean'||typeof c.decidedAt!=='string')throw 0}catch(e){document.documentElement.setAttribute('data-consent','pending')}`
