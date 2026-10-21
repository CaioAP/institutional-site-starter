<script setup lang="ts">
defineProps<{ heading: string, text?: string, id?: string }>()
</script>

<template>
  <div class="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div class="max-w-2xl">
      <h2
        :id="id"
        class="text-3xl font-semibold md:text-4xl"
      >
        {{ heading }}
      </h2>
      <p
        v-if="text"
        class="mt-3 text-lg text-text-muted"
      >
        {{ text }}
      </p>
    </div>
    <slot />
  </div>
</template>
