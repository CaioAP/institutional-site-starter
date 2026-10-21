/**
 * After client-side navigation, move focus to <main> so keyboard and screen
 * reader users start at the new content (the route announcer reads the title).
 * Skipped on first load and for in-page hash links.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  let pending = false

  router.afterEach((to, from) => {
    if (!from.matched.length) return // initial load
    if (to.path === from.path) return // same page (hash / query change)
    pending = true
  })

  nuxtApp.hook('page:finish', () => {
    if (!pending) return
    pending = false
    requestAnimationFrame(() => {
      document.getElementById('main')?.focus({ preventScroll: true })
    })
  })
})
