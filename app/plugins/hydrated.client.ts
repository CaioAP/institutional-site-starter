/**
 * Marks <html data-hydrated> once Vue has taken over the static HTML. Before
 * that, buttons have no handlers yet; e2e tests wait for this attribute.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:suspense:resolve', () => {
    document.documentElement.dataset.hydrated = ''
  })
})
