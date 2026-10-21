<script setup lang="ts">
import theme from '#theme'

const { t } = useI18n()
const localePath = useLocalePath()
const { mainNav, isActive, to } = useNavigation()

const menuOpen = ref(false)
const panel = ref<HTMLElement | null>(null)
const route = useRoute()

useFocusTrap(panel, menuOpen, () => (menuOpen.value = false))
watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border/40 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
    <div class="container-content flex h-18 items-center justify-between gap-6">
      <NuxtLink
        :to="localePath('/')"
        class="shrink-0"
        :aria-label="t('a11y.homeLink', { name: theme.brand.name })"
      >
        <img
          :src="theme.brand.logo.light"
          :width="theme.brand.logo.width"
          :height="theme.brand.logo.height"
          alt=""
        >
      </NuxtLink>

      <nav
        :aria-label="t('a11y.mainNav')"
        class="hidden lg:block"
      >
        <ul class="flex items-center gap-1">
          <li
            v-for="item in mainNav"
            :key="item.name"
          >
            <NuxtLink
              :to="to(item)"
              :aria-current="isActive(item) ? 'page' : undefined"
              class="inline-flex min-h-11 items-center rounded-md px-3 font-medium text-text no-underline hover:text-accent aria-[current=page]:text-accent aria-[current=page]:underline aria-[current=page]:decoration-2"
            >
              {{ t(item.labelKey) }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-1">
        <NuxtLink
          :to="localePath({ name: 'search' })"
          class="inline-flex size-11 items-center justify-center rounded-md text-text hover:text-accent"
          data-search-trigger
        >
          <UiIcon
            name="search"
            :label="t('nav.search')"
          />
        </NuxtLink>
        <LayoutLanguageSwitcher class="hidden sm:flex" />
        <button
          type="button"
          class="inline-flex size-11 items-center justify-center rounded-md text-text hover:text-accent lg:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          @click="menuOpen = true"
        >
          <UiIcon
            name="menu"
            :label="t('a11y.openMenu')"
          />
        </button>
      </div>
    </div>

    <div
      v-if="menuOpen"
      class="fixed inset-0 z-50 bg-surface-inverse/40 lg:hidden"
      @click="menuOpen = false"
    />
    <div
      v-if="menuOpen"
      id="mobile-menu"
      ref="panel"
      role="dialog"
      aria-modal="true"
      :aria-label="t('a11y.mainNav')"
      class="fixed inset-y-0 right-0 z-50 flex w-[min(22rem,100%)] flex-col gap-6 overflow-y-auto bg-surface p-5 shadow-xl lg:hidden"
    >
      <div class="flex justify-end">
        <button
          type="button"
          class="inline-flex size-11 items-center justify-center rounded-md text-text hover:text-accent"
          @click="menuOpen = false"
        >
          <UiIcon
            name="close"
            :label="t('a11y.closeMenu')"
          />
        </button>
      </div>
      <nav :aria-label="t('a11y.mainNav')">
        <ul class="flex flex-col">
          <li
            v-for="item in mainNav"
            :key="item.name"
          >
            <NuxtLink
              :to="to(item)"
              :aria-current="isActive(item) ? 'page' : undefined"
              class="flex min-h-12 items-center border-b border-border/30 text-lg font-medium text-text no-underline aria-[current=page]:text-accent"
            >
              {{ t(item.labelKey) }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <LayoutLanguageSwitcher />
    </div>
  </header>
</template>
