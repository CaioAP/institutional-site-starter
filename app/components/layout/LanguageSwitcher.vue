<script setup lang="ts">
/**
 * Links to the current page in every other locale. Detail pages register their
 * translations with `useAlternates`, so the link lands on the equivalent page,
 * or on the localized listing when there is no translation.
 */
import type { Locale } from '~~/lib/content/types'

const { locale, locales, t } = useI18n()
const alternateLink = useAlternateLink()

const others = computed(() => locales.value.filter(l => l.code !== locale.value))
</script>

<template>
  <ul
    :aria-label="t('a11y.languageSwitcher')"
    class="flex items-center gap-1"
  >
    <li
      v-for="l in others"
      :key="l.code"
    >
      <NuxtLink
        :to="alternateLink(l.code as Locale)"
        :lang="l.language"
        :hreflang="l.language"
        class="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-text no-underline hover:text-accent"
      >
        <UiIcon
          name="globe"
          :size="16"
        />
        <span>{{ l.name }}</span>
      </NuxtLink>
    </li>
  </ul>
</template>
