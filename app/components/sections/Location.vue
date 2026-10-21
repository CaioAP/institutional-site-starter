<script setup lang="ts">
import type { PageSection } from '~~/lib/content/types'

defineProps<{ section: Extract<PageSection, { type: 'location' }> }>()
const { t } = useI18n()
const localePath = useLocalePath()
const settings = await useSiteSettings()
</script>

<template>
  <section
    v-if="settings"
    class="container-content py-16 md:py-20"
  >
    <div class="grid gap-10 rounded-lg border border-border/30 bg-surface-muted p-8 md:grid-cols-2 md:p-12">
      <div>
        <h2 class="text-3xl font-semibold">
          {{ section.heading }}
        </h2>
        <p
          v-if="section.text"
          class="mt-3 text-lg text-text-muted"
        >
          {{ section.text }}
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <UiButtonLink :to="localePath({ name: 'contact' })">
            {{ t('home.contactCta') }}
          </UiButtonLink>
        </div>
      </div>
      <LayoutContactDetails :settings="settings" />
    </div>
  </section>
</template>
