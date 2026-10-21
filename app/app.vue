<script setup lang="ts">
import theme from '#theme'
import { CONSENT_HEAD_SCRIPT } from '~~/lib/consent'

const { t } = useI18n()

// <html lang>, canonical and hreflang links come from @nuxtjs/i18n (strict SEO mode).
useHead({
  // Shows the server-rendered consent banner before first paint when needed.
  script: [{ key: 'consent-state', innerHTML: CONSENT_HEAD_SCRIPT, tagPosition: 'head' }],
  titleTemplate: (title?: string) => (title ? `${title} | ${theme.brand.name}` : theme.brand.name),
})
// Keeps NuxtRouteAnnouncer in the active language.
const announcerMessage = (title: string) => t('a11y.pageLoaded', { title })
</script>

<template>
  <NuxtRouteAnnouncer v-slot="{ message }">
    {{ message ? announcerMessage(message) : "" }}
  </NuxtRouteAnnouncer>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
