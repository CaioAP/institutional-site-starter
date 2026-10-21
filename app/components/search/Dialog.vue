<script setup lang="ts">
/**
 * Search dialog (native <dialog>: modal, Esc closes, focus returns to the
 * trigger). Opens from the header button or the "/" keyboard shortcut.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const dialog = ref<HTMLDialogElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const { query, results, status } = useSearch()

function open() {
  if (!dialog.value || dialog.value.open) return
  dialog.value.showModal()
  input.value?.focus()
}
function close() {
  dialog.value?.close()
}

function onKey(e: KeyboardEvent) {
  if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
  const el = e.target as HTMLElement | null
  if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return
  e.preventDefault()
  open()
}

function submit() {
  close()
  navigateTo({ path: localePath({ name: 'search' }), query: { q: query.value } })
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
  window.addEventListener('search:open', open)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('search:open', open)
})
watch(() => route.fullPath, close)
</script>

<template>
  <dialog
    ref="dialog"
    aria-labelledby="search-dialog-title"
    class="m-auto mt-[10vh] w-[min(42rem,calc(100%-2rem))] rounded-lg bg-surface p-0 text-text shadow-2xl backdrop:bg-surface-inverse/50"
    @click.self="close"
  >
    <div class="p-5 md:p-6">
      <div class="mb-4 flex items-center justify-between gap-4">
        <h2
          id="search-dialog-title"
          class="text-xl font-semibold"
        >
          {{ t('search.label') }}
        </h2>
        <button
          type="button"
          class="inline-flex size-11 items-center justify-center rounded-md hover:text-accent"
          @click="close"
        >
          <UiIcon
            name="close"
            :label="t('search.close')"
          />
        </button>
      </div>
      <form
        role="search"
        class="flex gap-2"
        @submit.prevent="submit"
      >
        <label
          for="search-dialog-input"
          class="sr-only"
        >{{ t('search.label') }}</label>
        <input
          id="search-dialog-input"
          ref="input"
          v-model="query"
          type="search"
          autocomplete="off"
          :placeholder="t('search.placeholder')"
          aria-describedby="search-dialog-hint"
          class="min-h-12 w-full rounded-md border border-border bg-surface px-4 text-lg"
        >
        <button
          type="submit"
          class="min-h-12 rounded-md bg-accent px-5 font-semibold text-on-accent hover:bg-accent-strong"
        >
          {{ t('search.submit') }}
        </button>
      </form>
      <p
        id="search-dialog-hint"
        class="mt-2 text-xs text-text-muted"
      >
        {{ t('search.shortcut') }}
      </p>
      <SearchResults
        class="mt-4 max-h-[50vh] overflow-y-auto"
        :results="results.slice(0, 8)"
        :status="status"
        :query="query"
        @navigate="close"
      />
    </div>
  </dialog>
</template>
