/**
 * Feeds every route from `ContentSource.listRoutes()` to the prerenderer.
 * Runs once, while rendering "/" during `nuxt generate`; Nitro then queues the
 * routes sent in the x-nitro-prerender header. Link crawling is disabled in
 * nuxt.config.ts, so listRoutes() is the single source of truth.
 */
export default defineNuxtPlugin({
  name: 'prerender-routes',
  async setup() {
    if (!import.meta.prerender) return
    const route = useRoute()
    if (route.path !== '/') return
    const routes = await useContentSource().listRoutes()
    prerenderRoutes(routes.map(r => r.path))
  },
})
