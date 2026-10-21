import type { Ref } from 'vue'

/**
 * Entrance animation driven by IntersectionObserver.
 *
 * Safe by default: content is visible in the server HTML. On the client an
 * element is only hidden (then revealed) if it is still below the viewport and
 * the visitor hasn't asked for reduced motion, so it never delays LCP, never
 * hides content without JavaScript, and uses transform/opacity only (no CLS).
 */
let observer: IntersectionObserver | null = null

function getObserver() {
  observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-revealed')
      observer!.unobserve(entry.target)
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 })
  return observer
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function reveal(el: Element) {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return
  if (el.getBoundingClientRect().top < window.innerHeight) return // already on screen
  el.classList.add('reveal')
  getObserver().observe(el)
}

export function unreveal(el: Element) {
  observer?.unobserve(el)
}

/** Composable form: `const el = ref(); useReveal(el)` */
export function useReveal(target: Ref<Element | null | undefined>) {
  onMounted(() => target.value && reveal(target.value))
  onBeforeUnmount(() => target.value && unreveal(target.value))
}
