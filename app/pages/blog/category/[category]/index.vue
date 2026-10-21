<script setup lang="ts">
// Blog listing, page N — implemented with the pages milestone.
const { t } = useI18n()
useHead({ title: () => t('nav.blog') })
</script>

<template>
  <SectionsPageIntro :title="t('nav.blog')" />
</template>
