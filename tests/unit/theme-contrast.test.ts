import { describe, expect, it } from 'vitest'
import theme from '../../theme.config'
import { contrastRatio } from '../../lib/contrast'

/**
 * Guards WCAG 2.2 AA contrast for the brand palette, so a rebrand that breaks
 * accessibility fails CI instead of shipping.
 */
const c = theme.colors
const TEXT = 4.5 // 1.4.3 normal text
const UI = 3 // 1.4.11 non-text (borders, focus ring)

const pairs: Array<[string, string, string, number]> = [
  ['text on surface', c.text, c.surface, TEXT],
  ['text on surfaceMuted', c.text, c.surfaceMuted, TEXT],
  ['textMuted on surface', c.textMuted, c.surface, TEXT],
  ['textMuted on surfaceMuted', c.textMuted, c.surfaceMuted, TEXT],
  ['textInverse on surfaceInverse', c.textInverse, c.surfaceInverse, TEXT],
  ['accent (links) on surface', c.accent, c.surface, TEXT],
  ['accent (links) on surfaceMuted', c.accent, c.surfaceMuted, TEXT],
  ['accentStrong on surface', c.accentStrong, c.surface, TEXT],
  ['onAccent on accent (buttons)', c.onAccent, c.accent, TEXT],
  ['onAccent on accentStrong', c.onAccent, c.accentStrong, TEXT],
  ['danger on surface', c.danger, c.surface, TEXT],
  ['success on surface', c.success, c.surface, TEXT],
  ['border on surface (inputs)', c.border, c.surface, UI],
  ['focus ring on surface', c.focus, c.surface, UI],
  ['focus ring on surfaceMuted', c.focus, c.surfaceMuted, UI],
  ['inverse focus ring on surfaceInverse', c.textInverse, c.surfaceInverse, UI],
]

describe('theme contrast (WCAG 2.2 AA)', () => {
  it.each(pairs)('%s', (_label, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min)
  })
})

describe('contrastRatio', () => {
  it('matches known values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })
})
