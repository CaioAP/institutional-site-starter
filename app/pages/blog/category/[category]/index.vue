<script setup lang="ts">
const route = useRoute()
const category = String(route.params.category)
</script>

<template>
  <BlogListing
    :page="1"
    :category="category"
  />
</template>
