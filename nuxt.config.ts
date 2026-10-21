import tailwindcss from '@tailwindcss/vite'
import { localizedPages } from './i18n/routes'

export default defineNuxtConfig({

  modules: ['@nuxt/eslint', '@nuxtjs/i18n', '@nuxt/content', '@nuxt/image'],
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [{ name: 'theme-color', content: '#14213d' }],
    },
  },

  css: ['~/assets/css/base.css'],

  content: {
    experimental: { sqliteConnector: 'native' },
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      /** local | sanity – see lib/content/source.ts */
      contentSource: process.env.CONTENT_SOURCE || 'local',
    },
  },
  compatibilityDate: '2026-10-01',

  nitro: {
    prerender: {
      // Routes come from ContentSource.listRoutes() (app/plugins/prerender-routes.server.ts).
      crawlLinks: false,
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
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },

  image: {
    // `xs` lets components write mobile-first sizes like "xs:100vw md:50vw".
    screens: { 'xs': 320, 'sm': 640, 'md': 768, 'lg': 1024, 'xl': 1280, '2xl': 1536 },
    quality: 80,
  },
})
