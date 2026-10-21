import { describe, expect, it } from 'vitest'
import { mainNav, legalNav } from '~/composables/useNavigation'
import { localizedPages } from '~~/i18n/routes'

describe('navigation', () => {
  it('only links to pages that have translated paths', () => {
    for (const item of [...mainNav, ...legalNav]) {
      expect(localizedPages).toHaveProperty(item.name)
    }
  })
})
