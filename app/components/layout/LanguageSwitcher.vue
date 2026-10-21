<script setup lang="ts">
/**
 * Links to the current page in every other locale. Detail pages register their
 * translated slugs with `setI18nParams`, so the link lands on the equivalent page.
 */
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

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
        :to="switchLocalePath(l.code)"
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
