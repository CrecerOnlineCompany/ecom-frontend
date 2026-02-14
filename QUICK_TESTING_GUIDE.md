# Quick Testing Guide - QR & Terminal Payment Integration

## 🚀 Testing Rápido del Sistema

### Prerequisitos
- ✅ Frontend compilado (ya hecho)
- ⚠️ Backend con endpoints QR/Terminal implementados (VERIFICAR)
- ⚠️ Mercado Pago configurado en OpenAdmin

---

## 1️⃣ Prueba en Checkout

### Paso 1: Ir a Checkout
```
1. Ir a http://localhost:5173 (o tu URL)
2. Agregar al menos 1 entrada (click en asiento)
3. Hacer click en "Proceder al Pago"
```

### Paso 2: Seleccionar Mercado Pago
```
1. En "Método de Pago" → Seleccionar "Mercado Pago"
2. Debería aparecer:
   ├─ 📱 Código QR (nuevo)
   ├─ 🏪 Terminal Smart Point (nuevo)
   └─ 🔐 Redirección Segura (existente)
```

### Paso 3: Probar QR
```
1. Click en "📱 Código QR"
2. Debería:
   ✓ Mostrar código QR generado
   ✓ Mostrar instrucciones
   ✓ Mostrar información de transacción
   ✓ Iniciar monitoreo automático
   ✓ Cambiar a estado "completado" cuando se paga
```

### Paso 4: Probar Terminal
```
1. Click en "🏪 Terminal Smart Point"
2. Debería:
   ✓ Mostrar terminal virtual
   ✓ Mostrar monto a pagar
   ✓ Mostrar estado: "Acerca tu tarjeta"
   ✓ Iniciar monitoreo automático
   ✓ Cambiar a estado "confirmado" cuando se paga
```

---

## 2️⃣ Verificar en Navegador

### Abrir Developer Tools (F12)
```javascript
// En la consola, ejecutar:

// 1. Verificar que PaymentMethodService está cargado
console.log(typeof paymentMethodService)
// Debería mostrar: "object"

// 2. Ver servicios disponibles
PaymentMethodService
// Debería mostrar la clase

// 3. Verificar que los componentes están importados
// Ir a Elements → buscar "qr-payment-card" o "smart-point-card"
```

### Ver Network Requests
```
1. Abrir tab "Network"
2. Seleccionar Mercado Pago y un método
3. Buscar requests a:
   ✓ /api/payment-process-qr
   ✓ /api/payment-status/...
   ✓ /api/payment-process-terminal
   ✓ /api/terminal-payment-status/...
```

---

## 3️⃣ Debugging si no funciona

### ❌ No aparecen opciones de QR/Terminal

**Causa probable:** El proveedor no se llama "Mercado Pago"

**Verificar:**
1. En DevTools Console:
```javascript
// Ver qué proveedores se cargan
// Ir a Checkout → abrir Console
// Buscar "Payment providers loaded:"
```

2. Solución:
   - En OpenAdmin, editar el proveedor
   - Cambiar nombre a contiene "Mercado" (ej: "Mercado Pago")
   - Guardar
   - Recargar página

### ❌ Error: "Payment Provider ID not provided"

**Causa:** selectedPaymentMethod es null

**Solución:**
1. Asegurate de seleccionar un proveedor
2. Verifica que el proveedor tiene un `id`
3. En OpenAdmin, verificar que los proveedores están `is_active = true`

### ❌ Error: "No se puede generar QR"

**Causa probable:** Backend no tiene implementado `/api/payment-process-qr`

**Verificar:** En DevTools Network
1. Ver si la request a `/api/payment-process-qr` retorna error
2. Verificar respuesta (debería tener `success: true`)

### ❌ QR se genera pero no monitorea

**Causa:** Endpoint `/api/payment-status/{id}` no responde

**Verificar:**
1. En Network, ver requests a `/api/payment-status/...`
2. Debería retornar `{ status: "pending|completed|rejected" }`

---

## 4️⃣ Testing Manual con Postman

### Request: Procesar QR

```
POST http://tu-backend/api/payment-process-qr
Content-Type: application/json

{
  "payment_provider_id": 1,
  "screening_id": 123,
  "seat_ids": [1, 2, 3],
  "total_price": 100.00,
  "seat_count": 3,
  "customer_email": "test@test.com",
  "customer_name": "Juan Pérez"
}

Respuesta esperada:
{
  "success": true,
  "method": "qr",
  "qr_data": "00020126360014br.gov.bcb...",
  "payment_ticket_id": 456,
  "amount": 100.00
}
```

### Request: Verificar Estado QR

```
GET http://tu-backend/api/payment-status/456

Respuesta esperada:
{
  "status": "pending",
  "message": "Esperando pago",
  "payment_ticket_id": 456
}
```

### Request: Procesar Terminal

```
POST http://tu-backend/api/payment-process-terminal
Content-Type: application/json

{
  "payment_provider_id": 1,
  "screening_id": 123,
  "seat_ids": [1, 2, 3],
  "total_price": 100.00,
  "seat_count": 3,
  "customer_email": "test@test.com",
  "customer_name": "Juan Pérez"
}

Respuesta esperada:
{
  "success": true,
  "method": "terminal",
  "terminal_id": "TERMINAL_001",
  "order_id": "order_abc123",
  "amount": 100.00,
  "payment_ticket_id": 456
}
```

---

## ✅ Checklist de Validación

### Frontend
- [ ] QRPaymentCard.vue existe
- [ ] SmartPointCard.vue existe
- [ ] PaymentMethodService.js existe
- [ ] Checkout.vue importa los componentes
- [ ] Proyecto compila sin errores

### Backend
- [ ] Endpoint `/api/payment-process-qr` responde correctamente
- [ ] Endpoint `/api/payment-process-terminal` responde correctamente
- [ ] Endpoint `/api/payment-status/{id}` responde correctamente
- [ ] Endpoint `/api/terminal-payment-status/{id}` responde correctamente
- [ ] Endpoint `/api/payment-cancel/{id}` responde correctamente

### Configuration
- [ ] Mercado Pago está en OpenAdmin com name "Mercado Pago"
- [ ] Access Token está configurado
- [ ] Store ID está configurado
- [ ] QR está habilitado
- [ ] Terminal Smart está habilitado

### Integration
- [ ] Usuario puede seleccionar QR en checkout
- [ ] Usuario puede seleccionar Terminal en checkout
- [ ] QR se genera correctamente
- [ ] Terminal se inicializa correctamente
- [ ] Monitoreo automático funciona
- [ ] Redirección a confirmación funciona

---

## 🎯 Flujo Completo Esperado

```
1. Usuario agreg entradas
   ↓
2. Click "Proceder al Pago"
   ↓
3. Selecciona Mercado Pago
   ↓
4. Elige: QR / Terminal / Redirección
   ↓
5a. Si QR:
   • Se genera código
   • Se muestra en pantalla
   • Se monitorea cada 2s
   • Usuario escanea con Mercado Pago
   • En backend se confirma el pago
   • Frontend detecta cambio de estado
   • Se redirige a confirmación
   ↓
5b. Si Terminal:
   • Se inicializa terminal
   • Se muestra monto
   • Se espera lectura de tarjeta
   • Se monitorea cada 1.5s
   • Usuario acerca tarjeta
   • Terminal lee y procesa
   • Frontend detecta éxito/rechazo
   • Se redirige a confirmación
   ↓
6. Confirmación de pago
```

---

## 🚨 Errores Comunes y Soluciones

| Error | Solución |
|-------|----------|
| "Cannot read property 'name' of undefined" | Proveedor no cargó, recargar página |
| "paymentMethodType is not defined" | Bug en código, recompilar con `npm run build` |
| "Timeout esperando confirmación" | Backend no actualiza estado, verificar webhook |
| "CORS error" | Backend no permite origen del frontend, agregar CORS |
| "QR se genera pero no se actualiza" | Endpoint `/api/payment-status` no responde |
| "Terminal no responde" | Backend no tiene implementado o terminal_id incorrecto |

---

## 📞 Recursos

- **Guía principal:** [PAYMENT_INDEX.md](PAYMENT_INDEX.md)
- **Implementación:** [FRONTEND_IMPLEMENTATION_SUMMARY.md](FRONTEND_IMPLEMENTATION_SUMMARY.md)
- **Documentación Mercado Pago:** https://www.mercadopago.com/developers/es/docs
- **Vue 3 Docs:** https://vuejs.org

---

**Estado:** 🟢 LISTO PARA TESTING

Todos los componentes frontend están implementados y compilados. 
Solo falta verificar que el backend tiene los endpoints correctos.
