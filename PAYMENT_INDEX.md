# Configuración de Métodos de Pago Mercado Pago - QR y Smart Point

## Resumen

Se han implementado dos nuevos métodos de pago para Mercado Pago en tu sistema CINEA:

1. **QR** - Código QR dinámico para escanear con el teléfono
2. **Smart Point** - Terminal física de Mercado Pago Punto para tarjetas

Además del método original **Redirección Segura**.

---

## 📋 Cambios Realizados

### Backend (Laravel)

#### 1. **Controlador OpenAdmin Mejorado**
- Archivo: `app/Admin/Controllers/PaymentProviderController.php`
- Cambios:
  - Nuevo formulario con secciones divididas para configuración
  - Campos específicos para QR (tipo: nativo/personalizado)
  - Campos específicos para Smart Point (ID terminal, envío automático)
  - Vista mejorada con badges de métodos disponibles
  - Soporte para JSON avanzado

#### 2. **Servicio de Métodos de Pago**
- Archivo: `app/Services/PaymentMethods/PaymentMethodService.php` (NUEVO)
- Funcionalidad:
  - `getGroupedMethods()` - Agrupar por tipo de método
  - `getProvidersForMethod()` - Obtener proveedores que soportan un método
  - `isMethodSupported()` - Verificar disponibilidad global

#### 3. **Payment Provider Manager Actualizado**
- Archivo: `app/Services/PaymentProviders/PaymentProviderManager.php`
- Cambios:
  - Se agregaron handlers para QR y Terminal Smart
  - Métodos para iniciar pagos específicos por tipo

#### 4. **API Controller Extendido**
- Archivo: `app/Http/Controllers/Api/PaymentController.php`
- Nuevos endpoints:
  - `GET /api/payment-methods` - Obtener métodos agrupados
  - `GET /api/payment-methods/{method}/providers` - Proveedores para un método

#### 5. **Handlers Existentes**
Ya están implementados:
- `MercadoPagoQrHandler.php` - Genera QR dinámico
- `MercadoPagoPointHandler.php` - Envía a terminal Smart
- `MercadoPagoHandler.php` - Redirección estándar

---

### Frontend (Vue 3 + Vite)

#### 1. **Servicio de Métodos de Pago**
- Archivo: `resources/js/services/PaymentMethodService.js` (NUEVO)
- Métodos:
  ```javascript
  getMethods()                    // Obtener métodos disponibles
  getMethodProviders(method)      // Proveedores para un método
  processQrPayment(data)          // Procesar pago QR
  processTerminalPayment(data)    // Procesar pago Terminal
  generateQRCode(data, selector)  // Generar QR visual
  monitorTerminalPayment(id)      // Monitorear estado de pago
  downloadQRCode(filename)        // Descargar QR como imagen
  ```

#### 2. **Componente QR**
- Archivo: `resources/js/components/QRPaymentCard.vue` (NUEVO)
- Características:
  - Generación de código QR dinámico
  - Instrucciones paso a paso
  - Monitoreo automático de pago
  - Descarga del QR como imagen
  - Copia de datos del QR
  - Estados: cargando, error, generado, completado

#### 3. **Componente Smart Point**
- Archivo: `resources/js/components/SmartPointCard.vue` (NUEVO)
- Características:
  - Inicialización de terminal
  - Monitoreo en tiempo real
  - Contador de tiempo
  - Estados claros (esperando, procesando, completado, rechazado)
  - Soporte para cancelación
  - Información de tarjetas soportadas

---

## 🔧 Configuración en OpenAdmin

### Acceder a Payment Providers

1. Ve a: **Admin → Payment Providers**
2. Crea o edita un proveedor "Mercado Pago"

### Configuración Básica

| Campo | Valor | Requerido |
|-------|-------|-----------|
| **Nombre** | `mercado_pago` | ✅ |
| **Display Name** | `Mercado Pago` | ✅ |
| **Access Token** | APP_USR-xxxxxxx | ✅ |
| **Store ID / POS ID** | Tu ID de tienda | ✅ |
| **Currency ID** | ARS | ✅ |

### Habilitar Métodos de Pago

En la sección "Métodos de Pago Disponibles", marca las opciones que deseas:

- ✅ **Pago por Redirección** - Redirige a MP
- ✅ **Pago por QR** - Código dinámico
- ✅ **Pago por Terminal Smart** - Dispositivo físico

### Configuración QR

```json
{
  "qr_type": "native"    // native o custom
}
```

- **native**: QR oficial de Mercado Pago (requiere API especial)
- **custom**: QR personalizado con datos de transacción

### Configuración Smart Point

```json
{
  "terminal_id": "TERMINAL_001",
  "auto_send": true
}
```

- **terminal_id**: ID del dispositivo física
- **auto_send**: Enviar automáticamente la orden (`true`/`false`)

### Configuración JSON Avanzada

Para configuración personalizada, usa el campo "Configuración Completa (JSON)":

```json
{
  "access_token": "APP_USR-...",
  "store_id": "12345",
  "terminal_id": "TERMINAL_001",
  "currency_id": "ARS",
  "supported_methods": ["redirect", "qr", "terminal"],
  "qr_type": "native",
  "auto_send": true,
  "webhook_timeout": 300,
  "custom_field": "custom_value"
}
```

---

## 📱 Uso en Frontend

### Importar Componentes

```vue
<script>
import QRPaymentCard from '@/components/QRPaymentCard.vue'
import SmartPointCard from '@/components/SmartPointCard.vue'

export default {
  components: {
    QRPaymentCard,
    SmartPointCard
  }
}
</script>

<template>
  <!-- Componente QR -->
  <QRPaymentCard
    :payment-provider-id="1"
    :amount="500.00"
    :screening-id="123"
    :seat-ids="[1, 2, 3]"
    @payment-success="handleSuccess"
    @payment-error="handleError"
  />

  <!-- Componente Smart Point -->
  <SmartPointCard
    :payment-provider-id="1"
    :amount="500.00"
    :screening-id="123"
    :seat-ids="[1, 2, 3]"
    terminal-id="TERMINAL_001"
    @payment-success="handleSuccess"
    @payment-error="handleError"
    @payment-cancelled="handleCancelled"
  />
</template>
```

---

## 🔄 Flujo de Pago

### QR

```
Usuario selecciona QR
    ↓
Componente genera QR dinámico
    ↓
Mostrar código en pantalla
    ↓
Usuario escanea con Mercado Pago
    ↓
Monitorear estado automáticamente
    ↓
Confirmar pago
```

### Smart Point

```
Usuario selecciona Terminal Smart
    ↓
Componente inicializa terminal
    ↓
Orden enviada a dispositivo
    ↓
Usuario acerca tarjeta
    ↓
Monitorear estado en tiempo real
    ↓
Confirmar pago en terminal
```

---

## 🌐 Endpoints API

### Obtener Métodos de Pago

```
GET /api/payment-methods

Response:
{
  "success": true,
  "methods": {
    "redirect": [...],
    "qr": [...],
    "terminal": [...],
    "manual": [...]
  },
  "details": {
    "qr": {
      "icon": "📱",
      "label": "Código QR",
      "description": "...",
      "badge": "RÁPIDO"
    },
    ...
  }
}
```

### Obtener Proveedores para un Método

```
GET /api/payment-methods/qr/providers

Response:
{
  "success": true,
  "method": "qr",
  "providers": [...],
  "method_info": {
    "icon": "📱",
    "label": "Código QR",
    "description": "..."
  }
}
```

### Procesar Pago QR

```
POST /api/payment-process-qr

Request:
{
  "payment_provider_id": 1,
  "screening_id": 123,
  "seat_ids": [1, 2, 3],
  "total_price": 500.00,
  "seat_count": 3
}

Response:
{
  "success": true,
  "method": "qr",
  "qr_type": "native",
  "qr_data": "...",
  "payment_ticket_id": 456,
  "amount": 500.00
}
```

### Procesar Pago Terminal

```
POST /api/payment-process-terminal

Request:
{
  "payment_provider_id": 1,
  "screening_id": 123,
  "seat_ids": [1, 2, 3],
  "total_price": 500.00,
  "seat_count": 3
}

Response:
{
  "success": true,
  "method": "terminal",
  "terminal_id": "TERMINAL_001",
  "order_id": "order_...",
  "amount": 500.00,
  "payment_ticket_id": 456
}
```

---

## 📚 Archivos Modificados/Creados

### Creados
- ✅ `app/Services/PaymentMethods/PaymentMethodService.php`
- ✅ `resources/js/services/PaymentMethodService.js`
- ✅ `resources/js/components/QRPaymentCard.vue`
- ✅ `resources/js/components/SmartPointCard.vue`

### Modificados
- ✅ `app/Admin/Controllers/PaymentProviderController.php`
- ✅ `app/Services/PaymentProviders/PaymentProviderManager.php`
- ✅ `app/Http/Controllers/Api/PaymentController.php`

---

## 🧪 Testing

### Test QR en Checkout

```javascript
// En la consola del navegador
const service = new PaymentMethodService('/api');

// Obtener métodos
await service.getMethods();

// Procesar QR
await service.processQrPayment({
  payment_provider_id: 1,
  screening_id: 123,
  seat_ids: [1, 2],
  total_price: 100,
  seat_count: 2
});
```

### Test Smart Point

```javascript
// Procesar pago terminal
await service.processTerminalPayment({
  payment_provider_id: 1,
  screening_id: 123,
  seat_ids: [1, 2],
  total_price: 100,
  seat_count: 2
});
```

---

## ⚙️ Requisitos

### Backend
- Laravel 11+
- Mercado Pago SDK v2.x
- PHP 8.1+

### Frontend
- Vue 3+
- Vite
- Axios

### Navegador
- Soporte para Fetch API
- LocalStorage
- Canvas (para generar QR)

### Librerías Externas (Opcionales)
- `qrcode.js` - Para generar QR visuales en el cliente
- `html2canvas` - Para capturar y descargar QR

---

## 🐛 Solución de Problemas

### "No se puede generar QR"
- Verifica que `qrcode.js` esté incluirá en el HTML
- Comprueba que el Access Token sea válido

### "Terminal no responde"
- Verifica el `terminal_id` sea correcto
- Asegúrate de que la terminal esté conectada a la red
- Comprueba los logs del servidor

### "Webhook no se recibe"
- Verifica la URL del webhook en OpenAdmin
- Comprueba que el `webhook_secret` sea correcto
- Revisa los logs: `storage/logs/laravel.log`

---

## 📖 Documentación Oficial

- [Mercado Pago SDK PHP](https://github.com/mercadopago/sdk-php)
- [Mercado Pago API QR](https://www.mercadopago.com/developers/es/docs/point/api/intro-qr)
- [Mercado Pago Punto Integración](https://www.mercadopago.com/developers/es/docs/point/api/)

---

## 🔐 Seguridad

⚠️ **IMPORTANTE:**
- Nunca expongas el Access Token en el frontend
- Usa variables de entorno (`.env`)
- Los tokens deben estar en `config/database.php` o `.env`
- Valida todo en el backend antes de procesar
- Implementa rate limiting en los endpoints de pago

---

## 📝 Próximos Pasos

1. **Instalar qrcode.js:**
   ```bash
   npm install qrcode
   ```

2. **Compilar frontend:**
   ```bash
   npm run build
   ```

3. **Configurar en OpenAdmin:**
   - Ve a Admin → Payment Providers
   - Agregar/Editar Mercado Pago
   - Habilitar QR y Smart Point

4. **Testear endpoints:**
   - Usar Postman o curl para verificar APIs
   - Probar en navegador con consola abierta

5. **Personalizar estilos:**
   - Editar `.vue` files para ajustar colores/diseño
   - Recompilar con `npm run build`

---

¡Configuración completada! 🎉
