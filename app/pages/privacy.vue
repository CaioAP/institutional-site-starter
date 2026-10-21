<script setup lang="ts">
const { t } = useI18n()
const title = computed(() => t('nav.privacy'))
useHead({ title })
</script>

<template>
  <div>
    <SectionsPageIntro :title="title" />
    <div class="container-content py-12">
      <p>{{ t('placeholder.comingSoon') }}</p>
    </div>
  </div>
</template>
