# Testing Guide - Sistema de Pagos (Batch Payment)

## 🧪 Testing Manual Paso a Paso

### Precondiciones
- Backend Laravel ejecutándose en `http://localhost:8000`
- Frontend Vue ejecutándose en `http://localhost:5173`
- Base de datos con datos de prueba (screenings, seats, payment_providers)

---

## Test 1: Compra Básica (3 Asientos)

### Pasos
```
1. Home → Movies
   └─ Seleccionar película "Avatar 2" (o cualquiera)
   
2. Booking → Seleccionar 3 asientos
   ├─ Click en asiento A1 → Seleccionado (azul/highlight)
   ├─ Click en asiento A2 → Seleccionado
   ├─ Click en asiento A3 → Seleccionado
   └─ Carrito muestra: 3 items × $8 = $24
   
3. "Procesar compra" → Va a Checkout
   
4. Checkout → Verificar orden
   ├─ Items: 
   │  ├─ Asiento A1 ($8) [✕]
   │  ├─ Asiento A2 ($8) [✕]
   │  └─ Asiento A3 ($8) [✕]
   ├─ Subtotal: $24
   └─ Total: $24
   
5. Scroll down → Llenar formulario
   ├─ Email: test@example.com
   ├─ Nombre: Test User
   ├─ Teléfono: +34612345678
   ├─ Payment Method: [Seleccionar método disponible]
   └─ Si método = "Tarjeta de Crédito":
      ├─ Número: 4532015112830366
      ├─ Expiración: 12/25
      └─ CVC: 123
   
6. Click "Pagar"
   ├─ Loader aparece (spinner + "Procesando pago...")
   └─ Esperar respuesta del servidor
```

### Validación ✅
```
ESPERADO:
├─ Loader desaparece
├─ Redirección a Confirmation
├─ Muestra:
│  ├─ "Compra Completada" ✓
│  ├─ 3 entradas listadas
│  ├─ Total: $24
│  ├─ Números de ticket (TKT-...)
│  └─ Botón "Ver mis entradas"
├─ Backend:
│  ├─ 3 Tickets creados (status = 'confirmed')
│  ├─ 3 asientos marcados como 'booked'
│  ├─ Total en DB: $24
│  └─ Logs: "Created 3 tickets for batch payment"
└─ localStorage: cinea_cart = {} (limpio)

RESULTADO: ✓ PASS si todo coincide
```

### Verificar en Browser Console
```javascript
// Chrome DevTools → Console

// 1. Verificar request enviado
// Buscar en Network tab: POST /api/payment-process-batch
// Payload:
{
  "screening_id": 5,
  "seat_ids": [10, 11, 12],
  "payment_provider_id": 1,
  "customer_email": "test@example.com",
  "customer_name": "Test User",
  "customer_phone": "+34612345678"
}

// 2. Verificar response
// Status: 200 OK
// Response:
{
  "success": true,
  "tickets": [
    {"id": 45, "ticket_number": "TKT-...", "price": 8, "seat_id": 10},
    {"id": 46, "ticket_number": "TKT-...", "price": 8, "seat_id": 11},
    {"id": 47, "ticket_number": "TKT-...", "price": 8, "seat_id": 12}
  ],
  "total_price": 24,
  "tickets_count": 3
}

// 3. Verificar logs en consola
console.log('Batch payment response:', response)
// Debe mostrar: tickets_count: 3, total_price: 24
```

---

## Test 2: Eliminar Asiento Antes de Pagar

### Pasos
```
1. Booking → Seleccionar 3 asientos (A1, A2, A3)
   └─ Carrito: 3 × $8 = $24
   
2. "Procesar compra" → Checkout
   
3. Ver 3 items en la orden
   ├─ Asiento A1 ($8) [✕]
   ├─ Asiento A2 ($8) [✕]
   └─ Asiento A3 ($8) [✕]
   
4. Click ✕ en asiento A2 (eliminar)
   
5. Verificar actualización automática:
   ├─ Items ahora muestra:
   │  ├─ Asiento A1 ($8)
   │  └─ Asiento A3 ($8)
   ├─ Subtotal: $16 (2 × $8)
   └─ Total: $16
   
6. Llenar formulario y "Pagar"
```

### Validación ✅
```
ESPERADO:
├─ Request enviado: seat_ids: [A1_ID, A3_ID] (sin A2)
├─ Response: total_price: 16, tickets_count: 2
├─ Backend: 2 Tickets creados (no 3)
├─ Confirmation muestra: 2 entradas × $8 = $16
└─ localStorage:
   ├─ cinea_cart: {items: [A1, A3]} antes del pago
   └─ cinea_cart: {} después del pago

RESULTADO: ✓ PASS si total es $16 (no $24)
```

---

## Test 3: Eliminar Todos los Asientos

### Pasos
```
1. Booking → Seleccionar 2 asientos
   
2. Checkout → Eliminar TODOS los asientos
   ├─ Click ✕ primer asiento
   └─ Click ✕ segundo asiento
   
3. Carrito vacío:
   ├─ Total: $0
   └─ Botón "Pagar" debería estar disabled/oculto
   
4. Intent: Click "Pagar" (si está enabled)
```

### Validación ✅
```
ESPERADO:
├─ Carrito vacío mensaje: "El carrito está vacío"
├─ Botón "Pagar" deshabilitado o no visible
├─ No envía request al backend
└─ Mostrar error: "El carrito está vacío"

RESULTADO: ✓ PASS si no se envía request
```

---

## Test 4: Volver a Booking (Edit Seats)

### Pasos
```
1. Booking → Seleccionar 3 asientos (A1, A2, A3)
   
2. "Procesar compra" → Checkout
   
3. Click "← Volver a modificar asientos"
   
4. Debe volver a Booking y:
   ├─ 3 asientos aún están seleccionados ✓
   ├─ Carrito muestra 3 items × $8 = $24 ✓
   └─ localStorage restaurado correctamente ✓
   
5. Deseleccionar 1 asiento (A2)
   ├─ Carrito ahora: 2 × $8 = $16
   └─ Checkout se actualizará al volver
   
6. "Procesar compra" nuevamente
```

### Validación ✅
```
ESPERADO:
├─ Asientos seleccionados visibles en ambas páginas
├─ Carrito sincronizado entre Booking y Checkout
├─ localStorage mantiene estado correcto
├─ Total actualizado correctamente
└─ Puedo editar cuantas veces quiera

RESULTADO: ✓ PASS si todo está sincronizado
```

---

## Test 5: Recargar Página en Checkout (Persistencia)

### Pasos
```
1. Booking → Seleccionar 3 asientos
   
2. "Procesar compra" → Checkout
   
3. Llenar el formulario:
   ├─ Email: test@example.com
   ├─ Nombre: Test User
   ├─ Teléfono: +34612345678
   ├─ Tarjeta: 4532015112830366
   └─ etc...
   
4. IMPORTANTE: NO HACER CLICK EN PAGAR AÚN
   
5. F5 (Recargar página)
   
6. Verificar que:
   ├─ Carrito aún tiene 3 asientos × $24
   ├─ Formulario aún tiene datos ingresados:
   │  ├─ Email: test@example.com
   │  ├─ Nombre: Test User
   │  └─ etc...
   └─ Total: $24
```

### Validación ✅
```
ESPERADO:
├─ localStorage:cinea_cart No se borró
├─ localStorage:cinea_checkout_form No se borró
├─ Datos restaurados correctamente
└─ Carrito y formulario intactos

RESULTADO: ✓ PASS si todo está restaurado
```

---

## Test 6: Error - Asiento No Disponible

### Pasos
```
1. Usuario A: Booking → Selecciona asiento A1
   
2. Usuario A: "Procesar compra" → Checkout
   
3. EN OTRA PESTAÑA O USUARIO B:
   └─ Mismo asiento A1 ya fue comprado
   
4. Usuario A: Intenta "Pagar"
   ├─ Request enviado: seat_ids: [A1_ID]
   └─ Esperando respuesta...
```

### Validación ✅
```
ESPERADO:
├─ Response: status 422 (Unprocessable Entity)
├─ Error message: "Un asiento ya está reservado..."
├─ Backend: ROLLBACK (no crea ticket)
├─ Frontend: Mostrar error
│  ├─ error.value = "...asiento no disponible..."
│  └─ isProcessing = false
├─ Loader desaparece
├─ Usuario puede reintentar o cambiar asientos
└─ localStorage: Carrito NO se limpia (permite reintentar)

RESULTADO: ✓ PASS si maneja error correctamente
```

---

## Test 7: Múltiples Asientos (5-10 Items)

### Pasos
```
1. Booking → Seleccionar 5 asientos
   └─ Total: 5 × $8 = $40
   
2. Checkout → Verificar 5 items
   
3. Eliminar 2 → 3 asientos quedan
   └─ Total: 3 × $8 = $24
   
4. Pagar
   ├─ Request: seat_ids: [3 IDs]
   └─ Response: total_price: 24, tickets_count: 3
```

### Validación ✅
```
ESPERADO:
├─ Total SIEMPRE = items.length × $8
├─ Batch payment maneja cualquier cantidad
├─ Backend crea tickets para TODOS en 1 transacción
└─ Performance: Rápido (mejor que 5 requests)

RESULTADO: ✓ PASS si totales correctos
```

---

## 🔍 Verificación en Base de Datos

### Después de compra exitosa, ejecutar:

```sql
-- 1. Ver tickets creados
SELECT id, ticket_number, screening_id, seat_id, price, status 
FROM tickets 
WHERE status = 'confirmed' 
ORDER BY created_at DESC 
LIMIT 5;

-- Expected: 3 rows (o número de asientos comprados)
-- price: 8.00 para cada uno
-- status: 'confirmed'

-- 2. Ver asientos como booked
SELECT id, seat_number, status 
FROM seats 
WHERE id IN (10, 11, 12);

-- Expected: status = 'booked' para los asientos comprados

-- 3. Verificar total correcto
SELECT COUNT(*) as total_tickets, SUM(price) as total_amount
FROM tickets 
WHERE status = 'confirmed' 
AND created_at > NOW() - INTERVAL 1 HOUR;

-- Expected: total_tickets = 3, total_amount = 24.00

-- 4. Ver logs
SHOW ERRORS;
-- Should see: "Batch payment request" + "Created 3 tickets"
```

---

## 📊 Checklist de Validación Final

### Frontend
- [ ] Carrito persiste en localStorage
- [ ] Total se calcula correctamente: asientos × $8
- [ ] Eliminar asiento actualiza total
- [ ] Volver a Booking mantiene selección
- [ ] Recargar Checkout restaura carrito y formulario
- [ ] Loader aparece mientras procesa
- [ ] Confirmación muestra todos los tickets

### Backend
- [ ] POST /api/payment-process-batch responde correctamente
- [ ] Valida screening_id y seat_ids
- [ ] Crea tickets para TODOS los asientos
- [ ] total_price = count(seat_ids) × screening.price
- [ ] Retorna tickets con números únicos
- [ ] Rollback si error (no tickets huérfanos)
- [ ] Logs registran el batch payment

### Base de Datos
- [ ] Tickets creados con status 'confirmed'
- [ ] Asientos marcados como 'booked'
- [ ] Total en DB coincide con frontend
- [ ] No hay tickets duplicados o huérfanos

### Errores
- [ ] Asiento no disponible → Error 422
- [ ] screening_id inválido → Error 422
- [ ] payment_provider_id inválido → Error 422
- [ ] Carrito vacío → Error (no envía request)

---

## 🚀 Prueba Rápida (5 minutos)

```
1. Home → Movies → Avatar 2
2. Booking → Seleccionar A1, A2, A3
3. Procesar compra
4. Llenar formulario (test@example.com, ...)
5. Pagar
6. ✓ Ver "Compra Completada" con 3 tickets
7. ✓ Verificar BD: 3 tickets con total $24
8. ✓ localStorage limpio (cinea_cart = {})
```

---

## 🐛 Debugging Tips

### Si no funciona, verificar:

```javascript
// 1. Console logs
console.log('Batch payment response:', response)
// Should show: tickets_count, total_price, tickets array

// 2. Network tab
// Look for: POST /api/payment-process-batch
// Status: 200 OK
// Payload: seat_ids array, screening_id, provider_id

// 3. localStorage
localStorage.getItem('cinea_cart')
// After payment should be: {} (vacío)

// 4. localStorage before payment
localStorage.getItem('cinea_checkout_form')
// Should have: email, name, phone, card data

// 5. Backend logs
tail -f storage/logs/laravel.log | grep "Batch payment"
// Should see: "Batch payment request" + "Created N tickets"
```

### Errores Comunes

```
❌ "El carrito está vacío"
✓ Solución: Asegúrate de haber seleccionado asientos en Booking

❌ "Por favor selecciona un método de pago"
✓ Solución: Selecciona un payment method en Checkout

❌ Response status 422 "Un asiento ya está reservado"
✓ Solución: Asiento ya fue comprado, selecciona otro

❌ Total en Checkout = $24 pero respuesta = $16
✓ Solución: Verificar que no eliminaste asientos por error

❌ Loader infinito (no para)
✓ Solución: Ver error en Network tab → console logs
```

---

## 📝 Reporte de Issues

Si encuentras un problema, reportar:

```
1. Descripción del issue
2. Pasos para reproducir
3. Comportamiento esperado vs actual
4. Screenshots/videos
5. Logs (console + backend)
6. Ambiente (browser, dispositivo, version)
```

---

**¡Lista para testing!** 🎉
