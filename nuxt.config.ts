import tailwindcss from '@tailwindcss/vite'
import { localizedPages } from './i18n/routes'
import { readBuildEnv } from './lib/deploy/env'

/** Build env (see .env.example); postgenerate reads the same values. */
const env = readBuildEnv()
/** Public origin of the site. Canonical URLs, hreflang, sitemap and OG images use it. */
const SITE_URL = env.siteUrl

export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-schema-org',
  ],
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [{ name: 'theme-color', content: '#14213d' }],
    },
  },

  css: ['~/assets/css/base.css'],

  site: {
    url: SITE_URL,
    name: 'Exemplo Advocacia',
    defaultLocale: 'pt-BR',
    // Previews (lib/deploy/env.ts): robots.txt disallows all, pages get noindex.
    env: env.siteEnv,
    indexable: env.siteEnv === 'production',
  },

  content: {
    experimental: { sqliteConnector: 'native' },
  },

  runtimeConfig: {
    public: {
      siteUrl: SITE_URL,
      /** local | sanity – see lib/content/source.ts */
      contentSource: env.contentSource,
      /** netlify | endpoint – see lib/forms/contact.ts */
      formProvider: env.formProvider,
      /** Used when formProvider = endpoint (e.g. https://formspree.io/f/xxxx) */
      formEndpoint: env.formEndpoint,
      /** none | ga4 | plausible – loaded only after consent */
      analyticsProvider: env.analyticsProvider,
      /** GA4 measurement ID (G-XXXX) or Plausible domain */
      analyticsId: env.analyticsId,
      /** Plausible script URL (self-hosted instances) */
      plausibleSrc: env.plausibleSrc,
      /** Set to "false" to hide the floating WhatsApp button */
      whatsappButton: env.whatsappButton,
    },
  },
  compatibilityDate: '2026-10-01',

  nitro: {
    // Plain static output in .output/public on every host (no host auto-detection).
    preset: 'static',
    prerender: {
      // Routes come from ContentSource.listRoutes() (app/plugins/prerender-routes.server.ts).
      crawlLinks: false,
      // Write /sobre.html, not /sobre/index.html: Cloudflare Pages and Netlify
      // serve it at /sobre with no redirect, which matches the canonical URLs.
      autoSubfolderIndex: false,
      routes: ['/'],
      failOnError: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: { strict: true },

  eslint: {
    config: { stylistic: true },
  },

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'pt-BR',
    locales: [
      { code: 'pt-BR', language: 'pt-BR', name: 'Português', file: 'pt-BR.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
    ],
    customRoutes: 'config',
    pages: localizedPages,
    detectBrowserLanguage: false,
    // Strict SEO drops hreflang links for locales a page has no translation for.
    experimental: { strictSeo: true },
    baseUrl: SITE_URL,
  },

  image: {
    // `xs` lets components write mobile-first sizes like "xs:100vw md:50vw".
    screens: { 'xs': 320, 'sm': 640, 'md': 768, 'lg': 1024, 'xl': 1280, '2xl': 1536 },
    quality: 80,
  },

  robots: {
    // Preview deployments (see lib/deploy/env.ts) get noindex + Disallow: /
    disallow: [],
  },

  schemaOrg: {
    // Identity (LegalService) is defined from SiteSettings in app/app.vue.
    identity: undefined,
  },

  sitemap: {
    // Routes come from ContentSource.listRoutes() (server/api/__sitemap__/urls.ts).
    sources: ['/api/__sitemap__/urls'],
    excludeAppSources: true,
    xsl: false,
  },
})
