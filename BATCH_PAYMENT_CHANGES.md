# Cambios en el Sistema de Pago (Batch Payment)

## Problema Original
El sistema procesaba los pagos uno por uno (un asiento por request):
- Si se compraban 3 asientos → 3 requests individuales
- Si el proveedor requería redirección → se redicionaba después del PRIMER request
- Los otros 2 asientos nunca se procesaban

## Solución: Batch Payment
Ahora procesa TODOS los asientos en UN SOLO request:
- 3 asientos → 1 request con `seat_ids: [1, 2, 3]`
- Más eficiente (1 transacción DB vs 3)
- Totales calculados correctamente en el backend
- La redirección ocurre DESPUÉS de procesar todos

## Cambios Realizados

### 1. **Backend: Nuevo endpoint `processBatchPayment()`**
   - **Archivo:** `/app/Http/Controllers/Api/PaymentController.php`
   - **Ruta:** `POST /api/payment-process-batch`
   - **Entrada:** 
     ```json
     {
       "screening_id": 5,
       "seat_ids": [10, 11, 12],
       "payment_provider_id": 1,
       "customer_email": "user@email.com",
       "customer_name": "Juan Pérez",
       "customer_phone": "+34612345678"
     }
     ```
   - **Salida:**
     ```json
     {
       "success": true,
       "tickets": [
         {"id": 45, "ticket_number": "TKT-1234567890-abc123", "price": 8, "seat_id": 10},
         {"id": 46, "ticket_number": "TKT-1234567890-def456", "price": 8, "seat_id": 11},
         {"id": 47, "ticket_number": "TKT-1234567890-ghi789", "price": 8, "seat_id": 12}
       ],
       "total_price": 24,
       "tickets_count": 3,
       "transaction_id": "TXN123",
       "redirect_url": "https://provider.com/pay?txn=TXN123",
       "requires_redirect": true
     }
     ```
   - **Características:**
     - Valida que TODOS los asientos estén disponibles ANTES de crear tickets
     - Crea tickets para TODOS los asientos en una sola transacción DB
     - Calcula el total correctamente: `total_price = number_of_seats × seat_price`
     - Procesa el pago con el PRIMER ticket (como agregador)
     - Si falla → cambia status a `payment_failed` para todos los tickets
     - Rollback automático si hay error

### 2. **Backend: Ruta agregada en `routes/api.php`**
   ```php
   Route::post('/payment-process-batch', [PaymentController::class, 'processBatchPayment']);
   ```

### 3. **Frontend: Nuevo método en `paymentService.js`**
   - **Función:** `processBatchPayment(batchPaymentData)`
   - **Propósito:** Enviar múltiples asientos en UN request
   - **Ubicación:** `src/services/paymentService.js`
   - **Uso:**
     ```javascript
     const response = await paymentService.processBatchPayment({
       screening_id: 5,
       seat_ids: [10, 11, 12],
       payment_provider_id: 1,
       customer_email: "user@email.com",
       customer_name: "Juan Pérez",
       customer_phone: "+34612345678"
     })
     ```

### 4. **Frontend: Actualizado `useCheckoutForm.js` - Función `processPayment()`**
   - **Cambio:** Ahora usa `processBatchPayment()` en lugar de un loop individual
   - **Antes:**
     ```javascript
     for (const item of cartStore.items) {
       const response = await paymentService.processPayment({...})
       // Redirección después de CADA item ❌
     }
     ```
   - **Ahora:**
     ```javascript
     const seatIds = cartStore.items.map(item => item.seat_id)
     const response = await paymentService.processBatchPayment({
       seat_ids: seatIds,
       // ... otros datos
     })
     // Redirección DESPUÉS de procesar TODOS ✅
     ```
   - **Mejoras:**
     - Todos los asientos en UN request
     - El total viene correctamente calculado desde el backend
     - Los tickets vienen en la respuesta
     - La redirección ocurre DESPUÉS de completar todo

## Flujo Completo

### Antes (❌ Problemático)
```
Usuario selecciona 3 asientos
    ↓
Click en "Procesar Pago"
    ↓
Loop: for item in cartStore.items {
  Request 1: processPayment({seat_id: 10})
    ↓ Success → total = 8
  Check: requires_redirect? → SÍ
  ↓ REDIRIGE AQUÍ ❌ (items 11, 12 nunca se envían)
  window.location = redirectUrl
}
Requests 2 y 3 nunca se envían
    ↓
Backend solo tiene 1 ticket (no 3)
Total incorrecto en historial
```

### Ahora (✅ Correcto)
```
Usuario selecciona 3 asientos
    ↓
Click en "Procesar Pago"
    ↓
Request BATCH: processBatchPayment({
  seat_ids: [10, 11, 12],
  screening_id: 5,
  ...
})
    ↓
Backend crea 3 tickets en 1 transacción
Backend retorna: total_price = 24, tickets_count = 3
    ↓
Frontend recibe respuesta completa ✅
Check: requires_redirect? → SÍ
    ↓ REDIRIGE AQUÍ ✅ (todos los tickets ya fueron creados)
window.location = redirectUrl
    ↓
Backend tiene 3 tickets correctamente
Total correcto: 24 (3 × 8)
```

## Testing Manual

### Prueba 1: Compra de múltiples asientos
```
1. Home → Movies → Booking
2. Seleccionar 3 asientos (A1, A2, A3)
3. "Procesar compra"
4. Ingresar datos (email, nombre, teléfono, tarjeta)
5. Seleccionar Payment Method
6. Click "Pagar"
7. ✅ Verificar:
   - Total en Checkout: $24 (3 × $8)
   - Request enviado al backend: /payment-process-batch con seat_ids: [10, 11, 12]
   - Backend retorna: 3 tickets + total_price: 24
   - Redirección a proveedor de pago (si aplica)
```

### Prueba 2: Eliminar asiento antes de pagar
```
1. Seleccionar 3 asientos
2. Ir a Checkout
3. Ver 3 items en la orden
4. Click ✕ para eliminar uno (A2)
5. Total se actualiza a $16 (2 × $8)
6. "Pagar"
7. ✅ Verificar:
   - Request enviado: seat_ids: [10, 12] (sin el 11)
   - Total calculado: $16
   - Backend crea 2 tickets (no 3)
```

### Prueba 3: Compra de un solo asiento (caso simple)
```
1. Seleccionar 1 asiento
2. "Procesar compra"
3. "Pagar"
4. ✅ Verificar:
   - Request enviado: seat_ids: [10]
   - Total: $8
   - Backend crea 1 ticket
```

## Beneficios

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Requests** | 3 requests (múltiples) | 1 request |
| **Transacciones DB** | 3 transacciones | 1 transacción |
| **Tickets creados** | Parcial (si error en 2/3) | Atómico (todos o ninguno) |
| **Totales** | Incorrectos (redirección temprana) | Correctos |
| **Eficiencia** | Media | Alta |
| **Confiabilidad** | Baja (puede fallar a mitad) | Alta (transacción atómica) |

## Archivos Modificados

1. ✅ `/app/Http/Controllers/Api/PaymentController.php`
   - Agregado: `processBatchPayment()` method (lines 90-216)
   - ~127 líneas de código nuevo

2. ✅ `/routes/api.php`
   - Agregado: `Route::post('/payment-process-batch', ...)`

3. ✅ `src/services/paymentService.js`
   - Agregado: `processBatchPayment()` method

4. ✅ `src/composables/useCheckoutForm.js`
   - Modificado: `processPayment()` function
   - Cambio: Loop individual → Batch single request

## Build Status
- ✅ Frontend compilation: SUCCESS (3.16s, 0 errors)
- ✅ All dependencies resolved
- ✅ No breaking changes to existing code

## Backward Compatibility
- ✅ Endpoint antiguo `/payment-process` (single seat) sigue funcionando
- ✅ No cambios en otros endpoints
- ✅ Métodos antiguos en PaymentController intactos

## Próximos Pasos (Opcional)
1. Deprecar el método `processPayment()` del frontend en favor de `processBatchPayment()`
2. Crear endpoint de batch refund si es necesario
3. Agregar logging detallado para auditoría de pagos
4. Crear tests unitarios para el nuevo endpoint
