<script setup lang="ts">
/**
 * LGPD cookie banner, shown until the visitor decides; "Reject" is exactly as
 * prominent and as easy as "Accept". Not modal: the page stays usable, and
 * nothing optional loads until a choice is made.
 *
 * The banner is part of the static HTML but hidden by CSS unless a tiny inline
 * script (CONSENT_HEAD_SCRIPT, added in app.vue) finds no stored decision. So it
 * paints with the page instead of popping in after hydration (which would make
 * it a late LCP element), it never flashes for returning visitors, and it stays
 * hidden without JavaScript, where its buttons couldn't work anyway.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { choice, load, acceptAll, rejectAll, preferencesOpen } = useConsent()

onMounted(load)

const visible = computed(() => !choice.value && !preferencesOpen.value)
const buttonClass = 'inline-flex min-h-11 flex-1 items-center justify-center rounded-md px-4 font-semibold sm:flex-none'
</script>

<template>
  <section
    v-if="visible"
    aria-labelledby="consent-title"
    class="on-inverse fixed inset-x-0 bottom-0 z-50 border-t border-text-inverse/20 bg-surface-inverse text-text-inverse shadow-2xl"
    data-consent-banner
  >
    <div class="container-content flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div class="max-w-3xl">
        <h2
          id="consent-title"
          class="font-sans text-base font-semibold"
        >
          {{ t('consent.title') }}
        </h2>
        <p class="mt-1 text-sm">
          <i18n-t
            keypath="consent.text"
            scope="global"
          >
            <template #link>
              <NuxtLink
                :to="localePath({ name: 'privacy' })"
                class="text-text-inverse underline hover:text-text-inverse"
              >{{ t('nav.privacy').toLowerCase() }}</NuxtLink>
            </template>
          </i18n-t>
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          :class="[buttonClass, 'bg-surface text-text hover:bg-surface-muted']"
          @click="rejectAll"
        >
          {{ t('consent.reject') }}
        </button>
        <button
          type="button"
          :class="[buttonClass, 'bg-surface text-text hover:bg-surface-muted']"
          @click="acceptAll"
        >
          {{ t('consent.accept') }}
        </button>
        <button
          type="button"
          :class="[buttonClass, 'border border-text-inverse/60 text-text-inverse hover:bg-text-inverse/10']"
          @click="preferencesOpen = true"
        >
          {{ t('consent.customize') }}
        </button>
      </div>
    </div>
  </section>
</template>
