# 🔧 Guía de Integración en Checkout.vue

## Introducción

Este documento te guía paso a paso para integrar las nuevas páginas de pago en tu componente Checkout.vue.

---

## Paso 1: Importar el Composable

En tu **Checkout.vue**, en la sección `<script setup>`, agrega:

```javascript
import { usePaymentPages } from '@/composables/usePaymentPages'

const { goToSuccess, goToFailed } = usePaymentPages()
```

**Ubicación recomendada:** Al principio de tus imports.

---

## Paso 2: Actualizar tu Función de Procesar Pago

Localiza tu función `procesarPago` o similar y actualízala:

### Antes (Estructura actual):
```javascript
const procesarPago = async (datosFormulario) => {
  try {
    // Tu lógica de pago actual
    const respuesta = await paymentService.processPayment(datosFormulario)
    // ... resto del código
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Después (Con las nuevas páginas):
```javascript
const procesarPago = async (datosFormulario) => {
  try {
    // Procesar el pago
    const respuesta = await paymentService.processPayment(datosFormulario)

    if (respuesta.success) {
      // ✅ ÉXITO - Redirigir a página de éxito
      await goToSuccess(
        respuesta.ticketNumber,
        {
          movieTitle: datosFormulario.movieTitle || 'Película',
          screeningDate: datosFormulario.screeningDate || 'N/A',
          screeningTime: datosFormulario.screeningTime || 'N/A',
          seatNumber: datosFormulario.seatNumber || 'N/A',
          price: datosFormulario.price || '0.00'
        },
        true // true = auto-imprimir, false = solo mostrar botón
      )
    } else {
      // ❌ FALLO - Redirigir a página de fallo
      await goToFailed(
        respuesta.referenceCode || `ERR-${Date.now()}`,
        respuesta.errorCode || 'unknown_error',
        respuesta.errorMessage
      )
    }
  } catch (error) {
    console.error('Error al procesar pago:', error)
    // Redirigir a página de error genérico
    await goToFailed(
      `ERR-${Date.now()}`,
      'unknown_error',
      error.message
    )
  }
}
```

---

## Paso 3: Ejemplo Completo

Aquí está un ejemplo completo de cómo debería verse tu Checkout.vue:

```vue
<template>
  <div class="checkout-page">
    <!-- Tu formulario de checkout existente -->
    <form @submit.prevent="procesarPago">
      <!-- Tus campos de formulario -->
      <input v-model="formulario.movieTitle" placeholder="Película" />
      <input v-model="formulario.screeningDate" type="date" />
      <input v-model="formulario.screeningTime" type="time" />
      <input v-model="formulario.seatNumber" placeholder="Asiento" />
      <input v-model="formulario.price" type="number" placeholder="Precio" />
      
      <!-- Campos de pago -->
      <input v-model="formulario.cardNumber" placeholder="Número de tarjeta" />
      <!-- ... más campos ... -->
      
      <button type="submit" :disabled="procesando">
        {{ procesando ? 'Procesando...' : 'Pagar Ahora' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { usePaymentPages } from '@/composables/usePaymentPages'
import { paymentService } from '@/services/paymentService'

const { goToSuccess, goToFailed } = usePaymentPages()

const procesando = ref(false)
const formulario = reactive({
  movieTitle: '',
  screeningDate: '',
  screeningTime: '',
  seatNumber: '',
  price: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
  cardName: ''
})

const procesarPago = async () => {
  if (!validarFormulario()) {
    alert('Por favor completa todos los campos')
    return
  }

  procesando.value = true

  try {
    // Llamar al servicio de pago
    const respuesta = await paymentService.processPayment(formulario)

    if (respuesta.success) {
      // ✅ ÉXITO
      await goToSuccess(
        respuesta.ticketNumber,
        {
          movieTitle: formulario.movieTitle,
          screeningDate: formulario.screeningDate,
          screeningTime: formulario.screeningTime,
          seatNumber: formulario.seatNumber,
          price: formulario.price
        },
        false // Cambiar a true si quieres auto-imprimir
      )
    } else {
      // ❌ FALLO
      await goToFailed(
        respuesta.referenceCode || `ERR-${Date.now()}`,
        respuesta.errorCode || 'unknown_error'
      )
    }
  } catch (error) {
    console.error('Error:', error)
    await goToFailed(`ERR-${Date.now()}`, 'unknown_error')
  } finally {
    procesando.value = false
  }
}

const validarFormulario = () => {
  // Tu lógica de validación
  return Object.values(formulario).every(v => v !== '')
}
</script>

<style scoped>
/* Tus estilos */
</style>
```

---

## Paso 4: Datos Esperados del Backend

Tu backend debe retornar una respuesta con esta estructura:

### Respuesta de Éxito:
```json
{
  "success": true,
  "ticketNumber": "TICKET-2026-001",
  "transactionId": "TXN-20260121-123456",
  "amount": 10.00,
  "currency": "EUR",
  "timestamp": "2026-01-21T20:00:00Z"
}
```

### Respuesta de Fallo:
```json
{
  "success": false,
  "referenceCode": "ERR-20260121-001",
  "errorCode": "insufficient_funds",
  "errorMessage": "Tu cuenta no tiene fondos suficientes",
  "timestamp": "2026-01-21T20:00:00Z"
}
```

---

## Paso 5: Almacenamiento de Datos (Opcional)

Si quieres que los datos persistan en localStorage para recuperación automática:

```javascript
const guardarDatosTicket = (ticketNumber, datosFormulario) => {
  const ticketData = {
    ticketNumber,
    movieTitle: datosFormulario.movieTitle,
    screeningDate: datosFormulario.screeningDate,
    screeningTime: datosFormulario.screeningTime,
    seatNumber: datosFormulario.seatNumber,
    price: datosFormulario.price,
    purchaseDate: new Date().toISOString()
  }

  // Obtener tickets existentes
  const storedTickets = localStorage.getItem('tickets')
  const tickets = storedTickets ? JSON.parse(storedTickets) : []
  
  // Agregar nuevo ticket
  tickets.push(ticketData)
  
  // Guardar
  localStorage.setItem('tickets', JSON.stringify(tickets))
}

// Usar en procesarPago:
const procesarPago = async () => {
  // ... código anterior ...
  if (respuesta.success) {
    // Guardar antes de redirigir
    guardarDatosTicket(respuesta.ticketNumber, formulario)
    
    await goToSuccess(respuesta.ticketNumber, {
      movieTitle: formulario.movieTitle,
      screeningDate: formulario.screeningDate,
      screeningTime: formulario.screeningTime,
      seatNumber: formulario.seatNumber,
      price: formulario.price
    })
  }
}
```

---

## Paso 6: Prueba de Integración

### Opción A: Con Datos Simulados
```javascript
const procesarPago = async () => {
  // SOLO PARA PRUEBA - Remove después
  const success = Math.random() > 0.3
  
  if (success) {
    await goToSuccess('TICKET-TEST-001', {
      movieTitle: 'Avatar 3',
      screeningDate: '21/01/2026',
      screeningTime: '20:00',
      seatNumber: 'A1',
      price: '10.00'
    })
  } else {
    await goToFailed('ERR-TEST-001', 'insufficient_funds')
  }
}
```

### Opción B: Con API Real
```javascript
const procesarPago = async () => {
  try {
    const respuesta = await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formulario)
    })
    
    const data = await respuesta.json()
    
    if (data.success) {
      await goToSuccess(data.ticketNumber, {
        movieTitle: formulario.movieTitle,
        screeningDate: formulario.screeningDate,
        screeningTime: formulario.screeningTime,
        seatNumber: formulario.seatNumber,
        price: formulario.price
      })
    } else {
      await goToFailed(data.referenceCode, data.errorCode)
    }
  } catch (error) {
    await goToFailed(`ERR-${Date.now()}`, 'unknown_error')
  }
}
```

---

## Paso 7: Testear en el Navegador

1. Abre tu aplicación en desarrollo
2. Ve a la página de Checkout
3. Completa el formulario
4. Haz clic en "Pagar"
5. Deberías ser redirigido a:
   - `/payment-success?ticket=...` (si éxito)
   - `/payment-failed?ticket=...&error=...` (si fallo)

---

## Paso 8: Configurar Impresión Automática (Opcional)

Si quieres que la impresión se inicie automáticamente al éxito:

```javascript
// Cambiar el parámetro "false" a "true"
await goToSuccess(
  respuesta.ticketNumber,
  datosTicket,
  true  // ← Esto activa impresión automática
)
```

Cuando el usuario llegue a la página de éxito, se abrirá automáticamente el diálogo de impresión.

---

## Paso 9: Personalizar Mensajes de Error

Si quieres mostrar mensajes personalizados para cada tipo de error:

```javascript
const getMensajeError = (errorCode) => {
  const mensajes = {
    'insufficient_funds': '❌ Tu cuenta no tiene fondos suficientes',
    'card_declined': '❌ Tu banco rechazó esta transacción',
    'expired_card': '❌ Tu tarjeta ha expirado',
    'invalid_cvv': '❌ El CVV es incorrecto',
    'network_error': '❌ Error de conexión. Intenta de nuevo',
    'gateway_timeout': '❌ El servidor tardó demasiado. Intenta de nuevo',
    'authentication_failed': '❌ La autenticación falló',
    'duplicate_transaction': '❌ Esta transacción ya fue procesada',
    'unknown_error': '❌ Error desconocido. Intenta más tarde'
  }
  return mensajes[errorCode] || mensajes['unknown_error']
}

// Usar en goToFailed:
await goToFailed(
  respuesta.referenceCode,
  respuesta.errorCode,
  getMensajeError(respuesta.errorCode)
)
```

---

## Checklist de Integración

- [ ] Importé usePaymentPages
- [ ] Actualicé mi función procesarPago
- [ ] Agregué goToSuccess y goToFailed
- [ ] Probé con datos simulados
- [ ] Conecté con mi API real
- [ ] Probé éxito y fallo
- [ ] Actualicé el contacto en ambas vistas
- [ ] Probé impresión (si aplicable)
- [ ] Probé en mobile
- [ ] Desplegué a producción

---

## Preguntas Frecuentes

**P: ¿Qué pasa si no proporciono los datos del ticket?**
A: Las vistas mostrarán "N/A" en esos campos. Es recomendable proporcionar todos los datos.

**P: ¿Puedo cambiar el auto-print después?**
A: Sí, solo cambia el último parámetro de `goToSuccess` de `true` a `false` o viceversa.

**P: ¿Cómo manejo errores de red?**
A: En el bloque catch, llama a `goToFailed` con código 'network_error'.

**P: ¿Los datos se guardan?**
A: Solo en localStorage. Para persistencia real, guarda en tu backend.

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu integración está lista. 

Los usuarios verán:
- ✅ Página de éxito con opción de imprimir
- ❌ Página de error con opciones de recuperación

¡Buena suerte! 🚀
