<script setup lang="ts">
const route = useRoute()
const category = String(route.params.category)
const page = Number(route.params.page)
if (!Number.isInteger(page) || page < 2) throw createError({ statusCode: 404, fatal: true })
</script>

<template>
  <BlogListing
    :page="page"
    :category="category"
  />
</template>
