<script setup lang="ts">
const props = defineProps<{ statusCode?: number }>()
const { t } = useI18n()
const localePath = useLocalePath()
const isNotFound = computed(() => !props.statusCode || props.statusCode === 404)
const title = computed(() => (isNotFound.value ? t('error.notFoundTitle') : t('error.genericTitle')))
useHead({ title, meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <div>
    <SectionsPageIntro
      :title="title"
      :lead="isNotFound ? t('error.notFoundText') : undefined"
    />
    <div class="container-content py-12">
      <NuxtLink
        :to="localePath('/')"
        class="font-medium"
      >
        {{ t('error.backHome') }}
      </NuxtLink>
    </div>
  </div>
</template>
