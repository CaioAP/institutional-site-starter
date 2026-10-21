<script setup lang="ts">
import theme from '#theme'

const head = useLocaleHead()
const { t } = useI18n()

useHead({
  htmlAttrs: { lang: () => head.value.htmlAttrs.lang },
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
