<template>
  <span>{{ formatted }}</span>
</template>

<script setup>
import { computed } from 'vue'
import appConfig from '@/config/appConfig'

const props = defineProps({
  amount: { type: [Number, String], required: true },
})

const formatted = computed(() => {
  const value = Number(props.amount || 0)
  const currency = appConfig?.app?.currency || 'ARS'
  try {
    return new Intl.NumberFormat(appConfig?.app?.locale || 'es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
})
</script>

