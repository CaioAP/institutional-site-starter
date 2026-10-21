<script setup lang="ts">
/**
 * Labelled form field with hint and error wired through aria-describedby.
 * The control itself goes in the default slot and receives `describedBy` and
 * `invalid` to bind.
 */
const props = defineProps<{
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
}>()
const { t } = useI18n()
const describedBy = computed(() => [props.hint && `${props.id}-hint`, props.error && `${props.id}-error`].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      :for="id"
      class="font-semibold"
    >
      {{ label }}
      <span
        v-if="required"
        class="font-normal text-text-muted"
      >({{ t('form.required') }})</span>
    </label>
    <p
      v-if="hint"
      :id="`${id}-hint`"
      class="text-sm text-text-muted"
    >
      {{ hint }}
    </p>
    <slot
      :described-by="describedBy"
      :invalid="!!error"
    />
    <p
      v-if="error"
      :id="`${id}-error`"
      class="flex items-center gap-1.5 text-sm font-medium text-danger"
    >
      <UiIcon
        name="alert"
        :size="16"
      />
      {{ error }}
    </p>
  </div>
</template>
