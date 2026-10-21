import { describe, expect, it } from 'vitest'
import { CONSENT_VERSION, makeConsent, parseConsent } from '../../lib/consent'

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
