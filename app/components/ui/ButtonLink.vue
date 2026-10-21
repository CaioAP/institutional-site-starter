<script setup lang="ts">
/** A link styled as a button. Internal paths use NuxtLink. */
withDefaults(defineProps<{
  to: string
  variant?: 'primary' | 'secondary' | 'inverse'
}>(), { variant: 'primary' })
</script>

<template>
  <NuxtLink
    :to="to"
    class="inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-6 font-semibold no-underline transition-colors"
    :class="{
      'bg-accent text-on-accent hover:bg-accent-strong hover:text-on-accent': variant === 'primary',
      'border border-accent text-accent hover:bg-accent hover:text-on-accent': variant === 'secondary',
      'bg-surface text-text hover:bg-surface-muted hover:text-text': variant === 'inverse',
    }"
  >
    <slot />
  </NuxtLink>
</template>
