<script setup lang="ts">
/** Consent preferences dialog; opened from the banner or the footer link. */
const { t } = useI18n()
const { choice, preferencesOpen, load, save, acceptAll, rejectAll } = useConsent()
const dialog = ref<HTMLDialogElement | null>(null)
const analytics = ref(false)

function open() {
  load()
  preferencesOpen.value = true
}

watch(preferencesOpen, (isOpen) => {
  if (!dialog.value) return
  if (isOpen && !dialog.value.open) {
    analytics.value = !!choice.value?.analytics
    dialog.value.showModal()
  }
  else if (!isOpen && dialog.value.open) {
    dialog.value.close()
  }
})

onMounted(() => window.addEventListener('consent:open', open))
onBeforeUnmount(() => window.removeEventListener('consent:open', open))
</script>

<template>
  <dialog
    ref="dialog"
    aria-labelledby="consent-prefs-title"
    class="m-auto w-[min(34rem,calc(100%-2rem))] rounded-lg bg-surface p-0 text-text shadow-2xl backdrop:bg-surface-inverse/50"
    @close="preferencesOpen = false"
  >
    <form
      method="dialog"
      class="flex flex-col gap-5 p-6"
      @submit.prevent="save(analytics)"
    >
      <h2
        id="consent-prefs-title"
        class="text-2xl font-semibold"
      >
        {{ t('consent.preferencesTitle') }}
      </h2>

      <div class="flex gap-3">
        <input
          id="consent-necessary"
          type="checkbox"
          checked
          disabled
          class="mt-1 size-5 shrink-0 accent-accent"
          aria-describedby="consent-necessary-text"
        >
        <div>
          <label
            for="consent-necessary"
            class="font-semibold"
          >{{ t('consent.necessary') }}</label>
          <p
            id="consent-necessary-text"
            class="text-sm text-text-muted"
          >
            {{ t('consent.necessaryText') }}
          </p>
        </div>
      </div>

      <div class="flex gap-3">
        <input
          id="consent-analytics"
          v-model="analytics"
          type="checkbox"
          class="mt-1 size-5 shrink-0 accent-accent"
          aria-describedby="consent-analytics-text"
        >
        <div>
          <label
            for="consent-analytics"
            class="font-semibold"
          >{{ t('consent.analytics') }}</label>
          <p
            id="consent-analytics-text"
            class="text-sm text-text-muted"
          >
            {{ t('consent.analyticsText') }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          class="inline-flex min-h-11 items-center rounded-md bg-accent px-4 font-semibold text-on-accent hover:bg-accent-strong"
        >
          {{ t('consent.save') }}
        </button>
        <button
          type="button"
          class="inline-flex min-h-11 items-center rounded-md border border-border px-4 font-semibold"
          @click="rejectAll"
        >
          {{ t('consent.reject') }}
        </button>
        <button
          type="button"
          class="inline-flex min-h-11 items-center rounded-md border border-border px-4 font-semibold"
          @click="acceptAll"
        >
          {{ t('consent.accept') }}
        </button>
      </div>
    </form>
  </dialog>
</template>
