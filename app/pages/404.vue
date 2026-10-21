<script setup lang="ts">
// Prerendered as /404 and /en/404, then copied to 404.html per locale by
// scripts/postgenerate.ts so static hosts serve a localized not-found page.
</script>

<template>
  <SectionsNotFound :status-code="404" />
</template>
