<script setup lang="ts">
import theme from '#theme'

const { t } = useI18n()
const { legalNav, to } = useNavigation()
const year = new Date().getFullYear()
const settings = await useSiteSettings()
const tel = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`

const consentOpen = () => {
  // Opens the consent preferences dialog (wired in the consent feature).
  window.dispatchEvent(new CustomEvent('consent:open'))
}
</script>

<template>
  <footer class="on-inverse mt-24 bg-surface-inverse text-text-inverse">
    <div class="container-content grid gap-10 py-14 md:grid-cols-3">
      <div class="space-y-4">
        <img
          :src="theme.brand.logo.dark"
          :width="theme.brand.logo.width"
          :height="theme.brand.logo.height"
          :alt="theme.brand.name"
          loading="lazy"
        >
        <p
          v-if="settings"
          class="max-w-xs"
        >
          {{ settings.tagline }}
        </p>
      </div>

      <div>
        <h2 class="mb-3 font-sans text-sm font-semibold tracking-wide uppercase">
          {{ t('footer.contact') }}
        </h2>
        <ul
          v-if="settings"
          class="space-y-2"
        >
          <li>
            <a
              :href="`mailto:${settings.contact.email}`"
              class="text-text-inverse hover:text-text-inverse"
            >{{ settings.contact.email }}</a>
          </li>
          <li>
            <a
              :href="tel(settings.contact.phone)"
              class="text-text-inverse hover:text-text-inverse"
            >{{ settings.contact.phone }}</a>
          </li>
          <li>
            <address class="not-italic">
              {{ settings.address.street }}<br>
              {{ settings.address.city }} – {{ settings.address.region }}
            </address>
          </li>
          <li>{{ settings.officeHours }}</li>
        </ul>
      </div>

      <div>
        <h2 class="mb-3 font-sans text-sm font-semibold tracking-wide uppercase">
          {{ t('footer.follow') }}
        </h2>
        <ul class="flex gap-2">
          <li
            v-for="s in settings?.socials ?? theme.socials"
            :key="s.url"
          >
            <a
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex size-11 items-center justify-center rounded-md text-text-inverse hover:text-text-inverse"
            >
              <UiIcon
                :name="s.icon"
                :label="`${s.label} ${t('a11y.opensInNewTab')}`"
              />
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-text-inverse/20">
      <div class="container-content flex flex-col gap-4 py-6 text-sm md:flex-row md:items-center md:justify-between">
        <p>{{ t('footer.rights', { year, name: theme.brand.name }) }}</p>
        <nav :aria-label="t('a11y.footerNav')">
          <ul class="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li
              v-for="item in legalNav"
              :key="item.name"
            >
              <NuxtLink
                :to="to(item)"
                class="text-text-inverse hover:text-text-inverse"
              >
                {{ t(item.labelKey) }}
              </NuxtLink>
            </li>
            <li>
              <button
                type="button"
                class="cursor-pointer underline underline-offset-4"
                @click="consentOpen"
              >
                {{ t('nav.cookiePreferences') }}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </footer>
</template>
