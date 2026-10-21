<script setup lang="ts">
import type { PageSection } from '~~/lib/content/types'

defineProps<{ section: Extract<PageSection, { type: 'cta' }> }>()
</script>

<template>
  <section class="on-inverse bg-surface-inverse py-16 text-text-inverse">
    <div class="container-content flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div class="max-w-2xl">
        <h2 class="text-3xl font-semibold">
          {{ section.heading }}
        </h2>
        <p
          v-if="section.text"
          class="mt-3 text-lg"
        >
          {{ section.text }}
        </p>
      </div>
      <UiButtonLink
        :to="section.link.href"
        variant="inverse"
        class="shrink-0"
      >
        {{ section.link.label }}
        <UiIcon name="arrow-right" />
      </UiButtonLink>
    </div>
  </section>
</template>
