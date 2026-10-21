/**
 * Build-time environment, read once from process.env. Used by nuxt.config.ts
 * (runtime config) and scripts/postgenerate.ts (security headers), so both
 * see the same values and defaults. Every variable is documented in
 * .env.example; none is required.
 */
export interface BuildEnv {
  siteUrl: string
  /** production | preview. Previews are noindex. */
  siteEnv: 'production' | 'preview'
  contentSource: string
  formProvider: string
  formEndpoint: string
  analyticsProvider: string
  analyticsId: string
  plausibleSrc: string
  whatsappButton: boolean
}

type Env = Record<string, string | undefined>

/**
 * NUXT_SITE_ENV wins; otherwise Cloudflare Pages branch builds and Netlify
 * deploy previews / branch deploys are treated as previews.
 */
export function detectSiteEnv(env: Env): BuildEnv['siteEnv'] {
  if (env.NUXT_SITE_ENV) return env.NUXT_SITE_ENV === 'production' ? 'production' : 'preview'
  const productionBranch = env.PRODUCTION_BRANCH || 'main'
  if (env.CF_PAGES_BRANCH && env.CF_PAGES_BRANCH !== productionBranch) return 'preview'
  if (env.CONTEXT && env.CONTEXT !== 'production') return 'preview'
  return 'production'
}

export function readBuildEnv(env: Env = process.env): BuildEnv {
  return {
    siteUrl: (env.NUXT_PUBLIC_SITE_URL || 'https://www.example.com').replace(/\/$/, ''),
    siteEnv: detectSiteEnv(env),
    contentSource: env.CONTENT_SOURCE || 'local',
    formProvider: env.FORM_PROVIDER || 'netlify',
    formEndpoint: env.FORM_ENDPOINT || '',
    analyticsProvider: env.ANALYTICS_PROVIDER || 'none',
    analyticsId: env.ANALYTICS_ID || '',
    plausibleSrc: env.PLAUSIBLE_SRC || 'https://plausible.io/js/script.js',
    whatsappButton: env.WHATSAPP_BUTTON !== 'false',
  }
}
