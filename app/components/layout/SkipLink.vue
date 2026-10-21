<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <a
    href="#main"
    class="sr-only-focusable fixed top-2 left-2 z-50 rounded-md bg-surface-inverse px-4 py-3 font-medium text-text-inverse no-underline"
  >
    {{ t('a11y.skipToContent') }}
  </a>
</template>
