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
  </div>
</template>
