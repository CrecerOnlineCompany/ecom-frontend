# Payment Success & Failed Pages - Documentación

## Descripción General

Se han creado dos nuevas landing pages para manejar los estados de pagos exitosos y fallidos en el sistema de cine CINEA. Estas páginas incluyen funcionalidad de impresión térmica integrada.

## Nuevas Vistas Creadas

### 1. **PaymentSuccess.vue** (`/src/views/PaymentSuccess.vue`)
Landing page para pagos exitosos (completados).

**Características:**
- ✅ Confirmación visual del pago con animación
- 📋 Información detallada del ticket
- 🖨️ Botón para imprimir en impresora térmica
- 📥 Descarga del comprobante
- 📞 Información de contacto
- 🔄 Navegación a otras secciones

**URL de acceso:**
```
/payment-success?ticket=ABC123
```

**Parámetros:**
- `ticket` (query): Número del ticket (requerido)

---

### 2. **PaymentFailed.vue** (`/src/views/PaymentFailed.vue`)
Landing page para pagos fallidos o rechazados.

**Características:**
- ❌ Notificación clara del fallo
- 🔍 Información del error con código de referencia
- 💡 Posibles causas y soluciones
- 📞 Opciones de contacto prioritario
- 🔐 Confirmación de seguridad
- 🔄 Botones para reintentar

**URL de acceso:**
```
/payment-failed?ticket=ABC123&error=insufficient_funds
```

**Parámetros:**
- `ticket` o `reference` (query): Código de referencia del pago fallido
- `error` (query): Código del error (opcional)

---

## Códigos de Error Soportados

```javascript
{
  'insufficient_funds':      'Fondos insuficientes',
  'card_declined':           'Tarjeta rechazada',
  'expired_card':            'Tarjeta expirada',
  'invalid_cvv':             'CVV inválido',
  'network_error':           'Error de red',
  'gateway_timeout':         'Timeout del servidor',
  'authentication_failed':   'Autenticación fallida',
  'duplicate_transaction':   'Transacción duplicada',
  'unknown_error':           'Error desconocido'
}
```

---

## Servicio de Impresión Térmica

Ubicación: `/src/services/printService.js`

### Métodos Disponibles

#### `printThermalTicket(ticketData)`
Imprime un único ticket en formato térmico.

**Parámetros:**
```javascript
{
  ticketNumber: 'ABC123',           // Número de entrada
  movieTitle: 'La Película',         // Título de la película
  screeningDate: '21/01/2026',       // Fecha de la función
  screeningTime: '20:00',            // Hora de inicio
  seatNumber: 'A1',                  // Número de asiento
  price: '10.00'                     // Precio del ticket
}
```

**Retorna:** `Promise<boolean>`

**Ejemplo:**
```javascript
import { printService } from '@/services/printService'

const success = await printService.printThermalTicket({
  ticketNumber: 'TICKET001',
  movieTitle: 'Avatar 3',
  screeningDate: '21/01/2026',
  screeningTime: '20:00',
  seatNumber: 'A1',
  price: '10.00'
})

if (success) {
  console.log('Impresión iniciada')
} else {
  console.log('Error al imprimir')
}
```

---

#### `printMultipleTickets(ticketsData)`
Imprime múltiples tickets (entrada grupal).

**Parámetros:** Array de objetos con la misma estructura que `printThermalTicket`

**Ejemplo:**
```javascript
const tickets = [
  { ticketNumber: 'TICKET001', movieTitle: 'Avatar 3', ... },
  { ticketNumber: 'TICKET002', movieTitle: 'Avatar 3', ... }
]

await printService.printMultipleTickets(tickets)
```

---

#### `getTicketData(ticketNumber)`
Obtiene datos del ticket desde localStorage.

**Parámetros:**
- `ticketNumber` (string): Número del ticket

**Retorna:** Objeto con datos del ticket o datos por defecto

---

## Integración en Checkout

Para redirigir desde el Checkout a estas vistas:

### Pago Exitoso
```javascript
// En Checkout.vue o paymentService
router.push({
  name: 'PaymentSuccess',
  query: { ticket: 'TICKET_NUMBER' }
})

// O con ruta directa
router.push(`/payment-success?ticket=ABC123`)
```

### Pago Fallido
```javascript
// En Checkout.vue o paymentService
router.push({
  name: 'PaymentFailed',
  query: { 
    ticket: 'TICKET_NUMBER',
    error: 'insufficient_funds'
  }
})

// O con ruta directa
router.push(`/payment-failed?ticket=ABC123&error=insufficient_funds`)
```

---

## Características de Impresión

### Formato Térmico
- ✅ Ancho estándar de 80mm
- ✅ Compatible con impresoras ESC/POS
- ✅ Fuente monoespaciada para códigos
- ✅ Incluye código de barras simulado
- ✅ Separadores decorativos

### Contenido de la Impresión
```
╔════════════════════════════╗
║          CINEA             ║
║   Cines Independientes     ║
╠════════════════════════════╣
║ PELÍCULA: La Película      ║
║ FECHA: 21/01/2026  HORA... ║
║ ASIENTO: A1                ║
║ ENTRADA: ABC123XYZ         ║
║ PRECIO: 10.00 €            ║
╠════════════════════════════╣
║ Impreso: 21/01/2026 20:15  ║
║ Presenta código en entrada ║
╚════════════════════════════╝
```

### Compatibilidad
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Impresoras térmicas estándar

---

## Almacenamiento de Tickets

Los datos de los tickets se pueden almacenar en **localStorage** para recuperación automática:

```javascript
// Guardar tickets en localStorage
const ticketsData = [
  { ticketNumber: 'ABC123', movieTitle: '...', ... }
]
localStorage.setItem('tickets', JSON.stringify(ticketsData))

// Los servicios buscarán automáticamente en localStorage
```

---

## Estructura CSS

Ambas vistas incluyen:
- ✅ Diseño responsive (mobile-first)
- ✅ Animaciones suaves
- ✅ Degradados personalizados
- ✅ Estilos de impresión optimizados
- ✅ Accesibilidad mejorada

---

## Rutas Disponibles

| Ruta | Nombre | Componente | Parámetros |
|------|--------|-----------|-----------|
| `/payment-success` | PaymentSuccess | PaymentSuccess.vue | `?ticket=ABC123` |
| `/payment-failed` | PaymentFailed | PaymentFailed.vue | `?ticket=ABC123&error=code` |

---

## Próximos Pasos Recomendados

1. **Integrar con Checkout.vue**
   - Redirigir a estas vistas después de procesar pagos

2. **Conectar con Backend**
   - Enviar datos de tickets completos desde el servidor
   - Validar códigos de transacción

3. **Configurar Impresora**
   - Instalar driver de impresora térmica
   - Configurar en el navegador

4. **Pruebas**
   - Probar impresión en impresora térmica real
   - Validar respuesta en diferentes navegadores
   - Pruebas responsivas en dispositivos

---

## Notas Técnicas

- Las vistas están completamente desacopladas
- El servicio de impresión puede reutilizarse en otras partes de la app
- Los estilos de impresión están optimizados para papel de 80mm
- Compatible con tecnología ESC/POS de impresoras térmicas

---

## Soporte

Para preguntas o problemas relacionados con estas vistas o la funcionalidad de impresión, consulta la sección "Contacta con nuestro soporte" en las propias vistas.
