import { documentInternationalization } from '@sanity/document-internationalization'
import { ptBRLocale } from '@sanity/locale-pt-br'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { sitePath } from './preview'
import { LANGUAGES, TRANSLATED_TYPES } from './schemas/languages'
import { schemaTypes } from './schemas'
import { structure } from './structure'

/**
 * Sanity Studio sample for the starter. No real project is configured: set
 * SANITY_STUDIO_PROJECT_ID (see README.md) after creating one yourself.
 */
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
/** Where "Open preview" points: the live site, a preview deploy or `pnpm dev:sanity`. */
const siteUrl = (process.env.SANITY_STUDIO_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export default defineConfig({
  name: 'default',
  title: 'Institutional site',
  projectId,
  dataset,

  plugins: [
    structureTool({ structure }),
    documentInternationalization({
      supportedLanguages: LANGUAGES,
      schemaTypes: TRANSLATED_TYPES,
    }),
    // Studio interface in Portuguese. Remove for English.
    ptBRLocale(),
    visionTool({ defaultApiVersion: '2025-02-19' }),
  ],

  schema: {
    types: schemaTypes,
    // New documents are created in a language from the translation plugin's menu.
    templates: prev => prev.filter(t => !TRANSLATED_TYPES.includes(t.schemaType)),
  },

  document: {
    productionUrl: async (prev, { document }) => {
      const path = sitePath(document)
      return path ? `${siteUrl}${path}` : prev
    },
  },
})
