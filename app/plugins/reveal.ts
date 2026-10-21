import type { Directive } from 'vue'
import { reveal, unreveal } from '~/composables/useReveal'

/** `v-reveal` directive; see composables/useReveal.ts. No-op during SSR. */
const vReveal: Directive<Element> = {
  mounted: el => reveal(el),
  beforeUnmount: el => unreveal(el),
  getSSRProps: () => ({}),
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', vReveal)
})
