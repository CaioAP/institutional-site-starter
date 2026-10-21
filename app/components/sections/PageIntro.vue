<script setup lang="ts">
/** Page title block. Renders the page's single <h1>. */
defineProps<{
  title: string
  lead?: string
}>()
</script>

<template>
  <div class="border-b border-border/30 bg-surface-muted">
    <div class="container-content py-14 md:py-20">
      <slot name="before" />
      <h1 class="max-w-3xl text-4xl font-semibold md:text-5xl">
        {{ title }}
      </h1>
      <p
        v-if="lead"
        class="mt-4 max-w-2xl text-lg text-text-muted"
      >
        {{ lead }}
      </p>
    </div>
  </div>
</template>
