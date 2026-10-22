// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: ['studios/**/dist', 'studios/**/.sanity', '.lighthouseci'],
})
