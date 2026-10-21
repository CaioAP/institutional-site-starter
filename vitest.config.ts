import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        // Plain TypeScript: content layer, adapters, utilities.
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        // Checks that need a build first (`pnpm generate`): they read Nuxt
        // Content's database. Run with `pnpm test:build`.
        test: {
          name: 'build',
          include: ['tests/build/**/*.test.ts'],
          environment: 'node',
          testTimeout: 30_000,
        },
      },
      await defineVitestProject({
        // Components / composables that need the Nuxt runtime.
        test: {
          name: 'nuxt',
          include: ['tests/nuxt/**/*.test.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
