import { CONSENT_STORAGE_KEY, makeConsent, parseConsent, type ConsentChoice } from '~~/lib/consent'

/**
 * Shared consent state. `choice` is null until the visitor decides; it is only
 * read on the client (the static HTML never assumes consent).
 */
export function useConsent() {
  const choice = useState<ConsentChoice | null>('consent-choice', () => null)
  const loaded = useState('consent-loaded', () => false)
  const preferencesOpen = useState('consent-preferences-open', () => false)

  function load() {
    if (loaded.value || !import.meta.client) return
    try {
      choice.value = parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY))
    }
    catch {
      choice.value = null
    }
    loaded.value = true
  }

  function decide(analytics: boolean) {
    const previous = choice.value
    choice.value = makeConsent(analytics)
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice.value))
    }
    catch { /* private mode: choice lasts for this visit */ }
    preferencesOpen.value = false
    // Revoking analytics: scripts already running can't be unloaded, so clear
    // their cookies and reload without them.
    if (previous?.analytics && !analytics) {
      clearAnalyticsCookies()
      window.location.reload()
    }
  }

  return {
    choice,
    loaded,
    preferencesOpen,
    load,
    acceptAll: () => decide(true),
    rejectAll: () => decide(false),
    save: (analytics: boolean) => decide(analytics),
    analyticsAllowed: computed(() => !!choice.value?.analytics),
  }
}

function clearAnalyticsCookies() {
  const host = window.location.hostname
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]!.trim()
    if (!/^(_ga|_gid|_gat)/.test(name)) continue
    for (const d of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`
    }
  }
}
