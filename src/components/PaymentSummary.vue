<template>
  <div class="payment-summary">
    <div class="summary-card">
      <h3>Resumen de Pago</h3>

      <!-- Items -->
      <div class="summary-items">
        <div v-for="item in items" :key="item.id" class="summary-item">
          <span class="item-label">{{ item.label }}</span>
          <span class="item-price">{{ formatPrice(item.price) }}</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="summary-divider"></div>

      <!-- Subtotals -->
      <div class="summary-subtotal">
        <span>Subtotal:</span>
        <span>{{ formatPrice(subtotal) }}</span>
      </div>

      <div v-if="discount > 0" class="summary-discount">
        <span>Descuento:</span>
        <span class="discount-amount">-{{ formatPrice(discount) }}</span>
      </div>

      <div v-if="tax > 0" class="summary-tax">
        <span>Impuesto:</span>
        <span>{{ formatPrice(tax) }}</span>
      </div>

      <!-- Divider -->
      <div class="summary-divider"></div>

      <!-- Total -->
      <div class="summary-total">
        <span class="total-label">Total a Pagar:</span>
        <span class="total-amount">{{ formatPrice(total) }}</span>
      </div>

      <!-- Payment Method Info -->
      <div v-if="paymentMethod" class="payment-method-info">
        <div class="method-badge">
          <span class="badge-icon">{{ getPaymentIcon }}</span>
          <span>{{ paymentMethod }}</span>
        </div>
      </div>

      <!-- Security Badge -->
      <div class="security-badge">
        🔒 Pago 100% Seguro
      </div>

      <!-- Notes -->
      <div v-if="notes" class="payment-notes">
        <p>{{ notes }}</p>
      </div>
    </div>

    <!-- Payment Status -->
    <div v-if="status" class="payment-status" :class="`status-${status}`">
      <span v-if="status === 'pending'" class="status-icon">⏳</span>
      <span v-else-if="status === 'processing'" class="status-icon">⚙️</span>
      <span v-else-if="status === 'completed'" class="status-icon">✅</span>
      <span v-else-if="status === 'failed'" class="status-icon">❌</span>
      
      <span class="status-text">{{ statusMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { paymentService } from '@/services/paymentService'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  subtotal: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: null
    // 'pending', 'processing', 'completed', 'failed'
  },
  notes: {
    type: String,
    default: null
  }
})

const getPaymentIcon = computed(() => {
  if (!props.paymentMethod) return '💳'
  return paymentService.getProviderInfo(props.paymentMethod).icon
})

const statusMessage = computed(() => {
  const messages = {
    pending: 'Pago pendiente de procesamiento',
    processing: 'Procesando tu pago...',
    completed: '¡Pago completado exitosamente!',
    failed: 'El pago no pudo completarse'
  }
  return messages[props.status] || ''
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol'
  }).format(price)
}
</script>

<style scoped>
.payment-summary {
  margin: 2rem 0;
}

.summary-card {
  background: var(--gray-dark);
  border: 1px solid var(--gray-darker);
  border-radius: var(--border-radius-sm);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.summary-card h3 {
  font-size: 1.3rem;
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
}

.summary-items {
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.item-label {
  flex: 1;
}

.item-price {
  font-weight: 500;
  color: var(--text-primary);
}

.summary-divider {
  height: 1px;
  background: var(--gray-darker);
  margin: 1rem 0;
}

.summary-subtotal,
.summary-discount,
.summary-tax {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.95rem;
  color: var(--text-muted);
}

.discount-amount {
  color: var(--success);
  font-weight: 600;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.total-label {
  color: var(--text-secondary);
}

.total-amount {
  color: var(--primary);
}

.payment-method-info {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-darker);
}

.method-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--gray-darker);
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  color: var(--text-primary);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.badge-icon {
  font-size: 1.25rem;
}

.security-badge {
  text-align: center;
  padding: 1rem;
  margin-top: 1rem;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--border-radius-sm);
  color: var(--success);
  font-weight: 500;
  font-size: 0.9rem;
}

.payment-notes {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(245, 158, 11, 0.08);
  border-radius: var(--border-radius-sm);
  border-left: 4px solid var(--warning);
}

.payment-notes p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.payment-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  margin-top: 1.5rem;
  font-weight: 600;
}

.status-pending {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: var(--warning);
}

.status-processing {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: var(--primary);
}

.status-completed {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: var(--success);
}

.status-failed {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--danger);
}

.status-icon {
  font-size: 1.5rem;
}

.status-text {
  flex: 1;
}

@media (max-width: 768px) {
  .summary-card {
    padding: 1.5rem;
  }

  .summary-total {
    font-size: 1.1rem;
  }
}
</style>
