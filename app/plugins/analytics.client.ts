/**
 * Loads the configured analytics script only after the visitor consents.
 * ANALYTICS_PROVIDER: none | ga4 | plausible. Nothing is requested otherwise.
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public
  const provider = config.analyticsProvider
  const id = config.analyticsId
  if (provider === 'none' || !id) return

  const { analyticsAllowed, load } = useConsent()
  let injected = false

  function inject() {
    if (injected) return
    injected = true
    if (provider === 'plausible') {
      const s = document.createElement('script')
      s.defer = true
      s.dataset.domain = id
      s.src = config.plausibleSrc
      document.head.appendChild(s)
    }
    else if (provider === 'ga4') {
      const s = document.createElement('script')
      s.async = true
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
      document.head.appendChild(s)
      const w = window as unknown as { dataLayer: unknown[], gtag: (...args: unknown[]) => void }
      w.dataLayer = w.dataLayer || []
      w.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params -- gtag requires the arguments object
        w.dataLayer.push(arguments)
      }
      w.gtag('js', new Date())
      w.gtag('config', id, { anonymize_ip: true })
    }
  }

  load()
  watch(analyticsAllowed, allowed => allowed && inject(), { immediate: true })
})
