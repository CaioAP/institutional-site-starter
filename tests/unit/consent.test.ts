import { describe, expect, it } from 'vitest'
import { CONSENT_HEAD_SCRIPT, CONSENT_STORAGE_KEY, CONSENT_VERSION, makeConsent, parseConsent } from '../../lib/consent'

describe('consent storage', () => {
  it('round-trips a choice', () => {
    const c = makeConsent(true, new Date('2026-01-01T00:00:00Z'))
    expect(parseConsent(JSON.stringify(c))).toEqual({ version: CONSENT_VERSION, analytics: true, decidedAt: '2026-01-01T00:00:00.000Z' })
  })

  it('ignores missing, malformed or outdated values', () => {
    expect(parseConsent(null)).toBeNull()
    expect(parseConsent('{oops')).toBeNull()
    expect(parseConsent(JSON.stringify({ ...makeConsent(true), version: 0 }))).toBeNull()
    expect(parseConsent(JSON.stringify({ version: CONSENT_VERSION, analytics: 'yes' }))).toBeNull()
  })
})

describe('consent head script', () => {
  /** Runs the inline script against a fake localStorage and <html>. */
  function pending(stored: string | null, throws = false) {
    const attrs: Record<string, string> = {}
    const localStorage = {
      getItem: (key: string) => {
        if (throws) throw new Error('blocked')
        return key === CONSENT_STORAGE_KEY ? stored : null
      },
    }
    const document = { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } }
    new Function('localStorage', 'document', CONSENT_HEAD_SCRIPT)(localStorage, document)
    return attrs['data-consent'] === 'pending'
  }

  it.each([
    ['nothing stored', null],
    ['malformed', '{oops'],
    ['outdated version', JSON.stringify({ ...makeConsent(true), version: 0 })],
    ['wrong types', JSON.stringify({ version: CONSENT_VERSION, analytics: 'yes', decidedAt: 'x' })],
    ['a valid choice', JSON.stringify(makeConsent(false))],
  ])('agrees with parseConsent: %s', (_, stored) => {
    expect(pending(stored)).toBe(parseConsent(stored) === null)
  })

  it('shows the banner when storage is blocked', () => {
    expect(pending(null, true)).toBe(true)
  })
})
