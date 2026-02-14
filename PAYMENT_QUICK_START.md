# 🎬 Payment Pages - Guía Rápida

## ¿Qué se ha creado?

✅ **Dos nuevas vistas (landing pages) para estados de pago:**
- `PaymentSuccess.vue` - Para pagos completados exitosamente
- `PaymentFailed.vue` - Para pagos rechazados o fallidos

✅ **Servicio de impresión térmica:**
- `printService.js` - Maneja la impresión en impresoras térmicas

✅ **Composable para facilitar integración:**
- `usePaymentPages.js` - Hook para redirigir entre páginas de pago

---

## 🚀 Uso Rápido

### 1. **Pago Exitoso**

```javascript
import { usePaymentPages } from '@/composables/usePaymentPages'

const { goToSuccess } = usePaymentPages()

// Después de procesar el pago exitosamente:
await goToSuccess(
  'TICKET-001',  // Número de ticket
  {
    movieTitle: 'Avatar 3',
    screeningDate: '21/01/2026',
    screeningTime: '20:00',
    seatNumber: 'A1',
    price: '10.00'
  },
  true  // Auto-imprimir (opcional)
)
```

**URL directa:**
```
/payment-success?ticket=TICKET-001
```

---

### 2. **Pago Fallido**

```javascript
import { usePaymentPages } from '@/composables/usePaymentPages'

const { goToFailed } = usePaymentPages()

// Cuando falla el pago:
await goToFailed(
  'ERR-20260121-001',        // Código de referencia
  'insufficient_funds',      // Código de error
  'Fondos insuficientes'     // Mensaje (opcional)
)
```

**URL directa:**
```
/payment-failed?ticket=ERR-20260121-001&error=insufficient_funds
```

---

## 🖨️ Impresión Térmica

```javascript
import { printService } from '@/services/printService'

// Imprimir un ticket
const resultado = await printService.printThermalTicket({
  ticketNumber: 'TICKET-001',
  movieTitle: 'Avatar 3',
  screeningDate: '21/01/2026',
  screeningTime: '20:00',
  seatNumber: 'A1',
  price: '10.00'
})

if (resultado) {
  console.log('✓ Impresión iniciada')
} else {
  console.log('✗ Error al imprimir')
}
```

---

## 📋 Códigos de Error Disponibles

| Código | Significado |
|--------|-------------|
| `insufficient_funds` | Fondos insuficientes |
| `card_declined` | Tarjeta rechazada |
| `expired_card` | Tarjeta expirada |
| `invalid_cvv` | CVV inválido |
| `network_error` | Error de red |
| `gateway_timeout` | Timeout del servidor |
| `authentication_failed` | Autenticación fallida |
| `duplicate_transaction` | Transacción duplicada |
| `unknown_error` | Error desconocido |

---

## 📁 Archivos Creados

```
src/
├── views/
│   ├── PaymentSuccess.vue ........... Landing de pago exitoso
│   └── PaymentFailed.vue ............ Landing de pago fallido
├── services/
│   └── printService.js ............. Servicio de impresión térmica
├── composables/
│   └── usePaymentPages.js .......... Hook para redirigir pagos
└── router/
    └── index.js ..................... ✓ ACTUALIZADO con nuevas rutas

PAYMENT_PAGES_GUIDE.md ................. Guía completa
PAYMENT_INTEGRATION_EXAMPLE.js ........ Ejemplos de integración
```

---

## 🔗 Rutas Disponibles

| Ruta | Propósito | Query Params |
|------|-----------|--------------|
| `/payment-success` | Éxito del pago | `?ticket=ABC123` |
| `/payment-failed` | Fallo del pago | `?ticket=ABC123&error=code` |

---

## 💡 Integración en Checkout

En tu componente **Checkout.vue**, después de procesar el pago:

```vue
<script setup>
import { usePaymentPages } from '@/composables/usePaymentPages'

const { goToSuccess, goToFailed } = usePaymentPages()

const procesarPago = async (datosFormulario) => {
  try {
    const respuesta = await paymentService.processPayment(datosFormulario)
    
    if (respuesta.success) {
      await goToSuccess(respuesta.ticketNumber, {
        movieTitle: datosFormulario.pelicula,
        screeningDate: datosFormulario.fecha,
        screeningTime: datosFormulario.hora,
        seatNumber: datosFormulario.asiento,
        price: datosFormulario.precio
      }, true) // Auto-imprimir
    } else {
      await goToFailed(respuesta.referenceCode, respuesta.errorCode)
    }
  } catch (error) {
    await goToFailed(`ERR-${Date.now()}`, 'unknown_error')
  }
}
</script>
```

---

## 🎨 Características

### PaymentSuccess ✅
- Animación de éxito
- Información del ticket
- Botón de impresión térmica
- Descarga de entrada
- Información de contacto
- Links de navegación

### PaymentFailed ❌
- Animación de error
- Código de referencia
- Posibles causas
- Sugerencias de solución
- Contacto prioritario
- Confirmación de seguridad

---

## 📞 Información de Contacto (Configurable)

En ambas vistas está el contacto:
- **Email:** info@cinea.es
- **Teléfono:** +34 91 123 4567
- **Horario:** Lun-Dom 10:00-22:00

⚠️ **Nota:** Edita estas vistas para poner tu contacto real

---

## 🖥️ Compatibilidad de Impresión

✅ Impresoras térmicas estándar 80mm
✅ Formato ESC/POS
✅ Navegadores: Chrome, Firefox, Safari, Edge
✅ Cualquier impresora conectada al navegador

---

## 📄 Formato de Impresión

```
╔════════════════════════════╗
║          CINEA             ║
║   Cines Independientes     ║
╠════════════════════════════╣
║ PELÍCULA: Avatar 3         ║
║ FECHA: 21/01/2026 HORA...  ║
║ ASIENTO: A1                ║
║ ENTRADA: TICKET-001        ║
║ PRECIO: 10.00 €            ║
╠════════════════════════════╣
║ Impreso: 21/01/2026 20:15  ║
║ Presenta código en entrada ║
╚════════════════════════════╝
```

---

## ✅ Checklist de Implementación

- [x] Vistas creadas y estilizadas
- [x] Rutas agregadas al router
- [x] Servicio de impresión implementado
- [x] Composable para facilitar integración
- [x] Ejemplos de uso documentados
- [ ] Integración en Checkout.vue (⬅️ **Tu tarea**)
- [ ] Pruebas en impresora térmica
- [ ] Personalizar contacto y datos

---

## 🤔 Preguntas Frecuentes

**P: ¿Cómo personalizo el contacto?**
A: Edita `PaymentSuccess.vue` y `PaymentFailed.vue`, busca la sección `contact-section` y actualiza los datos.

**P: ¿Cómo integro con mi backend?**
A: Consulta `PAYMENT_INTEGRATION_EXAMPLE.js` para ver ejemplos de cómo esperar respuestas del servidor.

**P: ¿Qué datos necesito guardar?**
A: Mínimo: `ticketNumber`. Recomendado: agregar `movieTitle`, `screeningDate`, `screeningTime`, `seatNumber`, `price`.

**P: ¿La impresión funciona en línea?**
A: Sí, pero necesitas una impresora térmica configurada en tu sistema operativo.

---

## 🔧 Próximos Pasos

1. **Integra en Checkout** - Usa los ejemplos en `PAYMENT_INTEGRATION_EXAMPLE.js`
2. **Personaliza contacto** - Actualiza email y teléfono
3. **Prueba impresión** - Conecta una impresora térmica y prueba
4. **Almacenamiento** - Configura datos de tickets en localStorage

---

## 📚 Documentación Completa

Para más detalles, consulta:
- 📖 `PAYMENT_PAGES_GUIDE.md` - Guía completa
- 💻 `PAYMENT_INTEGRATION_EXAMPLE.js` - Ejemplos de código

---

**¡Listo para usar! 🚀**
