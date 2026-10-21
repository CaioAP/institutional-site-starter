import { describe, expect, it } from 'vitest'
import { detectSiteEnv, readBuildEnv } from '../../lib/deploy/env'
import { contentSecurityPolicy, formatHeadersFile, headerRules, headersFor, parseHeadersFile } from '../../lib/deploy/headers'

const directive = (csp: string, name: string) => csp.split('; ').find(d => d.startsWith(`${name} `))

describe('build env', () => {
  it('has safe defaults with no env vars at all', () => {
    expect(readBuildEnv({})).toMatchObject({
      siteUrl: 'https://www.example.com',
      siteEnv: 'production',
      contentSource: 'local',
      formProvider: 'netlify',
      analyticsProvider: 'none',
      whatsappButton: true,
    })
  })

  it('detects previews on Cloudflare Pages and Netlify', () => {
    expect(detectSiteEnv({ CF_PAGES_BRANCH: 'main' })).toBe('production')
    expect(detectSiteEnv({ CF_PAGES_BRANCH: 'feature/x' })).toBe('preview')
    expect(detectSiteEnv({ CF_PAGES_BRANCH: 'prod', PRODUCTION_BRANCH: 'prod' })).toBe('production')
    expect(detectSiteEnv({ CONTEXT: 'production' })).toBe('production')
    expect(detectSiteEnv({ CONTEXT: 'deploy-preview' })).toBe('preview')
    expect(detectSiteEnv({ CONTEXT: 'deploy-preview', NUXT_SITE_ENV: 'production' })).toBe('production')
  })
})

describe('content security policy', () => {
  it('allows no third parties by default', () => {
    const csp = contentSecurityPolicy(readBuildEnv({}), ['sha256-abc'])
    expect(directive(csp, 'script-src')).toBe('script-src \'self\' \'wasm-unsafe-eval\' \'sha256-abc\'')
    expect(directive(csp, 'connect-src')).toBe('connect-src \'self\'')
    expect(directive(csp, 'form-action')).toBe('form-action \'self\'')
  })

  it('adds the form endpoint and the analytics hosts only when configured', () => {
    const plausible = contentSecurityPolicy(readBuildEnv({
      FORM_PROVIDER: 'endpoint',
      FORM_ENDPOINT: 'https://formspree.io/f/abc',
      ANALYTICS_PROVIDER: 'plausible',
      PLAUSIBLE_SRC: 'https://stats.example.org/js/script.js',
    }), [])
    expect(directive(plausible, 'connect-src')).toBe('connect-src \'self\' https://formspree.io https://stats.example.org')
    expect(directive(plausible, 'form-action')).toBe('form-action \'self\' https://formspree.io')
    expect(directive(plausible, 'script-src')).toContain('https://stats.example.org')

    const ga4 = contentSecurityPolicy(readBuildEnv({ ANALYTICS_PROVIDER: 'ga4' }), [])
    expect(directive(ga4, 'script-src')).toContain('https://*.googletagmanager.com')
    expect(directive(ga4, 'connect-src')).toContain('https://*.google-analytics.com')
  })
})

describe('_headers file', () => {
  it('round-trips and matches paths like the hosts do', () => {
    const rules = parseHeadersFile(formatHeadersFile(headerRules(readBuildEnv({}), ['sha256-abc'])))
    expect(headersFor(rules, '/en/blog')['X-Frame-Options']).toBe('DENY')
    expect(headersFor(rules, '/_nuxt/entry.js')['Cache-Control']).toContain('immutable')
    expect(headersFor(rules, '/en/blog')['Cache-Control']).toBeUndefined()
  })

  it('marks previews noindex', () => {
    const preview = headerRules(readBuildEnv({ CF_PAGES_BRANCH: 'feature' }), [])
    expect(preview[0]!.headers['X-Robots-Tag']).toBe('noindex')
    expect(headerRules(readBuildEnv({}), [])[0]!.headers['X-Robots-Tag']).toBeUndefined()
  })
})
