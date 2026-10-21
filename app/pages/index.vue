<script setup lang="ts">
import theme from '#theme'

const { t } = useI18n()
useHead({ title: '' })
</script>

<template>
  <div>
    <SectionsPageIntro :title="theme.brand.name" />
    <div class="container-content py-12">
      <p>{{ t('placeholder.comingSoon') }}</p>
    </div>
  </div>
</template>
