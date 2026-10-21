import type { Ref } from 'vue'

const FOCUSABLE = [
  'a[href]', 'area[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])', 'iframe', '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',')

export function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter(el => !el.hasAttribute('inert') && el.getClientRects().length > 0)
}

/**
 * Keeps Tab / Shift+Tab inside `container` while `active` is true, closes on
 * Escape, and returns focus to the element that was focused before opening.
 */
export function useFocusTrap(
  container: Ref<HTMLElement | null | undefined>,
  active: Ref<boolean>,
  onEscape: () => void,
) {
  let previouslyFocused: HTMLElement | null = null

  function onKeydown(event: KeyboardEvent) {
    if (!active.value || !container.value) return
    if (event.key === 'Escape') {
      event.preventDefault()
      onEscape()
      return
    }
    if (event.key !== 'Tab') return
    const items = getFocusable(container.value)
    if (!items.length) {
      event.preventDefault()
      return
    }
    const first = items[0]!
    const last = items[items.length - 1]!
    const current = document.activeElement
    if (event.shiftKey && (current === first || !container.value.contains(current))) {
      event.preventDefault()
      last.focus()
    }
    else if (!event.shiftKey && (current === last || !container.value.contains(current))) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(active, async (isActive) => {
    if (!import.meta.client) return
    if (isActive) {
      previouslyFocused = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      if (container.value) getFocusable(container.value)[0]?.focus()
    }
    else {
      document.removeEventListener('keydown', onKeydown)
      previouslyFocused?.focus()
      previouslyFocused = null
    }
  })

  onBeforeUnmount(() => {
    if (import.meta.client) document.removeEventListener('keydown', onKeydown)
  })
}
