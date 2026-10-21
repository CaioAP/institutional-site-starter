import tailwindcss from '@tailwindcss/vite'
import { localizedPages } from './i18n/routes'

export default defineNuxtConfig({

  modules: ['@nuxt/eslint', '@nuxtjs/i18n'],
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [{ name: 'theme-color', content: '#14213d' }],
    },
  },

  css: ['~/assets/css/base.css'],

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },
  compatibilityDate: '2026-10-01',

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/en'],
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
})
