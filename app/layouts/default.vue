<script setup lang="ts">
const settings = await useSiteSettings()
useSiteIdentity(settings)
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <LayoutSkipLink />
    <LayoutSiteHeader />
    <main
      id="main"
      tabindex="-1"
      class="flex-1 focus:outline-none"
    >
      <slot />
    </main>
    <LayoutSiteFooter />
    <LayoutWhatsAppButton />
    <ConsentBanner />
    <ConsentPreferences />
  </div>
</template>
