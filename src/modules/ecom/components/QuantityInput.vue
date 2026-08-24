<template>
  <div class="qty">
    <button
      class="qty__btn"
      type="button"
      :disabled="disabled || modelValue <= min"
      @click="set(modelValue - 1)"
    >
      -
    </button>
    <input
      class="qty__input"
      type="number"
      :min="min"
      :max="max"
      :disabled="disabled"
      :value="modelValue"
      @input="onInput"
    >
    <button
      class="qty__btn"
      type="button"
      :disabled="disabled || modelValue >= max"
      @click="set(modelValue + 1)"
    >
      +
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 100 },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const clamp = (value) => Math.min(props.max, Math.max(props.min, value))

const set = (value) => {
  emit('update:modelValue', clamp(Number(value) || props.min))
}

const onInput = (e) => set(e.target.value)
</script>

<style scoped>
.qty {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.qty__btn {
  min-width: 48px;
  min-height: 48px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-alt);
  color: var(--text-primary);
  font-weight: 800;
  font-size: 18px;
  cursor: pointer;
}

.qty__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty__input {
  width: 88px;
  min-height: 48px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  padding: 10px 12px;
  font-weight: 700;
  text-align: center;
}
</style>
