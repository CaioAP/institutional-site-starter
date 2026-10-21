<script setup lang="ts">
// Detail page — wired to the content layer in milestones 2–3.
const route = useRoute()
const slug = computed(() => String(route.params.slug))
useHead({ title: slug })
</script>

<template>
  <div>
    <SectionsPageIntro :title="slug" />
  </div>
</template>
