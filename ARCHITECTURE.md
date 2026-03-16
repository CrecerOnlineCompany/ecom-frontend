# 🎬 CINEA Frontend - Arquitectura y API

## 📋 Índice
1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Arquitectura General](#arquitectura-general)
3. [Servicios API](#servicios-api)
4. [Estado Global (Stores)](#estado-global-stores)
5. [Composables](#composables)
6. [Vistas Principales](#vistas-principales)
7. [Componentes Principales](#componentes-principales)
8. [Flujo de Datos](#flujo-de-datos)

---

## 📂 Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables Vue
│   ├── Cart.vue            # Carrito de compras
│   ├── MovieCard.vue       # Tarjeta de película
│   ├── PaymentMethodSelector.vue
│   ├── QRPaymentCard.vue   # Pago por QR
│   ├── SmartPointCard.vue  # Pago por Terminal Smart Point
│   ├── PaymentTicketDisplay.vue  # Display de ticket de pago
│   ├── QRDisplayCard.vue
│   └── ...
├── composables/            # Lógica reutilizable (Vue 3 Composition API)
│   ├── useCheckoutForm.js  # Lógica del formulario de checkout
│   ├── usePaymentPages.js
│   ├── useAppConfig.js
│   └── useTicketValidator.js
├── views/                  # Vistas/Páginas
│   ├── Home.vue           # Página de inicio
│   ├── Movies.vue         # Listado de películas
│   ├── MovieDetail.vue    # Detalles de película
│   ├── Booking.vue        # Selección de asientos
│   ├── Checkout.vue       # Carrito y pago
│   ├── Confirmation.vue   # Confirmación de compra
│   ├── PaymentSuccess.vue
│   ├── PaymentFailed.vue
│   └── MyTickets.vue      # Mis entradas
├── services/              # Servicios API y lógica de negocio
│   ├── api.js            # Configuración base de Axios
│   ├── paymentService.js # Procesamiento de pagos
│   ├── PaymentMethodService.js  # Métodos de pago (QR, Terminal)
│   ├── ticketService.js  # Gestión de tickets
│   ├── printService.js   # Servicio de impresión
│   └── debugService.js
├── stores/               # Estado global (Pinia)
│   ├── cartStore.js      # Estado del carrito
│   └── authStore.js      # Estado de autenticación
├── router/               # Configuración de rutas Vue Router
│   └── index.js
├── config/               # Configuración de la aplicación
│   ├── appConfig.js      # Config general
│   └── themePresets.js   # Presets de temas
├── plugins/              # Plugins Vue
│   └── configPlugin.js
├── styles/               # Estilos globales y específicos
│   ├── checkout.css
│   └── touch-screen.css
├── utils/                # Funciones utilitarias
│   ├── imageHelper.js
│   └── placeholder.js
├── types/                # Definiciones de tipos (TypeScript/JSDoc)
│   └── payment.ts
├── App.vue              # Componente raíz
├── main.js              # Entrada principal
└── style.css            # Estilos globales
```

---

## 🏗️ Arquitectura General

### Capas de la Aplicación

```
┌─────────────────────────────────────────────────┐
│           Vistas/Pages (Vue)                     │
│    (Home, Booking, Checkout, Confirmation)      │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│        Componentes (Vue Components)              │
│  (MovieCard, Cart, PaymentCards, Forms, etc)    │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│   Composables (Vue 3 Composition API)           │
│  (useCheckoutForm, usePaymentPages, etc)       │
└──────────────────┬──────────────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
┌─────────▼──────┐  ┌──────▼─────────┐
│  State Store   │  │  API Services  │
│   (Pinia)      │  │ (Axios)        │
└────────┬───────┘  └────────┬───────┘
         │                   │
         └───────┬───────────┘
                 │
        ┌────────▼────────┐
        │   Backend API   │
        │  (Laravel/Edge) │
        └─────────────────┘
```

---

## 🔌 Servicios API

### Base Configuration

**Archivo:** `src/services/api.js`

```javascript
Base URL: http://localhost:8000/api (configurable por VITE_API_URL)
Timeout: 30000ms
Headers: application/json
```

---

### 1. **Payment Service** (`paymentService.js`)
Gestión general de pagos y proveedores

#### Endpoints:

| Método | Endpoint | Descripción | Params |
|--------|----------|-------------|--------|
| `GET` | `/payment-providers` | Obtener proveedores de pago | - |
| `GET` | `/payment-providers/:id` | Obtener proveedor específico | `providerId` |
| `POST` | `/payment-process` | Procesar pago individual | `{screening_id, seat_id, payment_provider_id, customer_email, customer_name, customer_phone}` |
| `POST` | `/payment-process-batch` | Procesar múltiples asientos | `{screening_id, seat_ids[], payment_provider_id, customer_email, customer_name, customer_phone}` |
| `GET` | `/payment-status/:id` | Obtener estado del pago | `paymentId` |

---

### 2. **Payment Method Service** (`PaymentMethodService.js`)
Métodos de pago específicos (QR, Terminal Smart Point)

#### Endpoints:

| Método | Endpoint | Descripción | Params |
|--------|----------|-------------|--------|
| `GET` | `/payment-methods` | Obtener métodos de pago | - |
| `GET` | `/payment-methods/:method/providers` | Obtener proveedores por método | `method` |
| `POST` | `/payment-process-qr` | Procesar pago QR | `{payment_provider_id, screening_id, seat_ids[], total_price, customer_email, customer_name}` |
| `POST` | `/payment-process-terminal` | Procesar pago Terminal | `{payment_provider_id, screening_id, seat_ids[], total_price, customer_email, customer_name}` |
| `GET` | `/payment-status/:id` | Obtener estado QR | `paymentTicketId` |
| `GET` | `/terminal-payment-status/:id` | Obtener estado Terminal | `orderId` |
| `POST` | `/payment-cancel/:id` | Cancelar pago | `paymentTicketId` |
| `POST` | `/validate-payment-session` | Validar sesión de pago | `{payment_ticket_id, screening_id, seat_ids[]}` |

---

### 3. **Ticket Service** (`ticketService.js`)
Gestión de cines, películas, funciones y asientos

#### Endpoints Cines:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/cinemas` | Obtener todos los cines |
| `GET` | `/cinemas/:id` | Obtener cine por ID |

#### Endpoints Películas:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/movies` | Obtener todas las películas |
| `GET` | `/movies/:id` | Obtener película por ID |

#### Endpoints Funciones (Screenings):

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/screenings` | Obtener todas las funciones |
| `GET` | `/screenings/:id` | Obtener función por ID |
| `GET` | `/screenings/:id/seats` | Obtener asientos de una función |

#### Endpoints Asientos:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/seats/:id` | Obtener asiento por ID |
| `PUT` | `/seats/:id` | Actualizar estado del asiento |

#### Endpoints Tickets:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/tickets` | Obtener tickets del usuario |
| `GET` | `/tickets/:id` | Obtener detalles del ticket |
| `POST` | `/tickets` | Crear nuevo ticket |

---

### 4. **Print Service** (`printService.js`)
Servicio de impresión de tickets

#### Métodos:

- `printTicket(ticketData)` - Imprimir ticket individual
- `printMultipleTickets(ticketsData)` - Imprimir múltiples tickets
- `generatePDF(ticketData)` - Generar PDF del ticket

---

## 🗂️ Estado Global (Stores)

### Pinia Store: `cartStore.js`

**Propósito:** Gestionar el carrito de compras y selección de entradas

**State:**
```javascript
{
  items: [],                    // Entradas seleccionadas
  screeningId: null,           // ID de la función
  totalPrice: 0,               // Precio total
  selectedSeats: []            // Asientos seleccionados
}
```

**Actions:**
- `addItem(seatData)` - Agregar entrada al carrito
- `removeItem(itemId)` - Eliminar entrada
- `clearCart()` - Vaciar carrito
- `updateItem(itemId, data)` - Actualizar entrada

**Getters:**
- `totalPrice` - Precio total del carrito
- `itemCount` - Cantidad de entradas
- `isEmpty` - Validar si está vacío

---

### Pinia Store: `authStore.js`

**Propósito:** Gestionar autenticación y datos del usuario

**State:**
```javascript
{
  user: null,
  token: null,
  isAuthenticated: false,
  userEmail: null
}
```

**Actions:**
- `login(credentials)` - Iniciar sesión
- `logout()` - Cerrar sesión
- `register(userData)` - Registrarse

---

## 🎣 Composables

### `useCheckoutForm.js`
Maneja toda la lógica del formulario de checkout

**Propósito:**
- Validación de formulario (email obligatorio, resto opcionales)
- Persistencia de datos en localStorage
- Procesamiento de pagos
- Formato de datos (tarjeta, fecha vencimiento)
- Manejo de errores

**API:**
```javascript
// State
form = {
  email: '',
  name: '',
  phone: '',
  cardNumber: '',
  cardExpiry: '',
  cardCVC: '',
  acceptTerms: false
}

// Methods
loadFormData()
saveFormData()
clearFormData()
validateForm()
formatCardNumber()
formatExpiryDate()
formatCVC()
loadPaymentProviders()
processPayment()
goBack()
```

---

### `usePaymentPages.js`
Gestiona la lógica de las páginas de pago

---

### `useAppConfig.js`
Configuración global de la aplicación

---

### `useTicketValidator.js`
Validación de tickets y datos de entrada

---

## 📄 Vistas Principales

### 1. **Home.vue** (`/`)
- Página de inicio
- Showcases de películas destacadas
- Links a categorías

### 2. **Movies.vue** (`/movies`)
- Listado completo de películas
- Filtros y búsqueda
- Cards con información y fotos

### 3. **MovieDetail.vue** (`/movie/:id`)
- Detalles de película
- Sinopsis, actores, duración
- Funciones disponibles

### 4. **Booking.vue** (`/booking/:id`)
- Selector de asientos
- Mapa de cine con asientos
- Carrito flotante
- Validaciones de selección

### 5. **Checkout.vue** (`/checkout`)
- Resumen del carrito
- Formulario de datos personales (solo email obligatorio)
- Selector de método de pago (QR, Terminal, Redirección)
- Integración de componentes de pago

### 6. **Confirmation.vue** (`/confirmation/:ticketNumbers`)
- Confirmación de compra exitosa
- Detalles de tickets
- Opciones de descarga e impresión

### 7. **PaymentSuccess.vue** (`/payment-success`)
- Confirmación visual de pago exitoso
- Detalles de transacción

### 8. **PaymentFailed.vue** (`/payment-failed`)
- Notificación de pago fallido
- Opción de reintentar

### 9. **MyTickets.vue** (`/my-tickets`)
- Mis entradas compradas
- Estado de entradas
- Impresión y descarga

---

## 🎨 Componentes Principales

### Componentes de Pago

#### **QRPaymentCard.vue**
Componente para pagos por código QR

**Props:**
- `paymentProviderId` (Number, required)
- `amount` (Number, required)
- `screeningId` (Number, required)
- `seatIds` (Array, required)
- `customerEmail` (String)
- `customerName` (String)

**Estados:**
- Loading: Generando QR
- Generated: QR listo
- Monitoring: Esperando confirmación
- Completed: Pago exitoso

**Events:**
- `@payment-success`
- `@payment-error`
- `@payment-cancelled`

---

#### **SmartPointCard.vue**
Componente para pagos con Terminal Smart Point

**Props:** (Similar a QRPaymentCard)

**Estados:**
- Loading: Inicializando terminal
- Waiting: Esperando tarjeta
- Processing: Procesando pago
- Completed: Pago exitoso

**Events:** (Similar a QRPaymentCard)

---

#### **PaymentTicketDisplay.vue** ⭐ NUEVO
Muestra número de transacción y instrucciones animadas

**Props:**
- `ticketNumber` (String, required)
- `amount` (Number, required)
- `paymentMethod` ('qr' | 'terminal', required)
- `statusText` (String)

**Características:**
- Número de ticket gigante con gradiente
- Efecto de resplandor dinámico
- Instrucciones paso a paso animadas
- Indicador de estado con pulse
- Responsive design

---

### Componentes de Carrito

#### **Cart.vue**
- Resumen de items
- Totalizaciones
- Acciones (editar, eliminar)

---

### Componentes de Películas

#### **MovieCard.vue**
- Tarjeta con información básica
- Foto, título, rating
- Links a detalles

---

### Componentes Formularios

#### **PaymentMethodSelector.vue**
- Selector visual de métodos de pago
- QR, Terminal, Redirección

---

## 🔄 Flujo de Datos

### Flujo de Compra

```
Home
  ↓
Movies (Browse)
  ↓
MovieDetail (Ver info)
  ↓
Booking (Seleccionar asientos)
  │
  └─→ cartStore.addItem(seat)
  │
  └─→ Cart (actualiza automáticamente)
  ↓
Checkout (Revisar y pagar)
  │
  ├─→ useCheckoutForm.loadFormData()
  ├─→ loadPaymentProviders() (API: GET /payment-providers)
  │
  ├─→ Seleccionar Método de Pago
  │   ├─ QR
  │   ├─ Terminal Smart Point
  │   └─ Redirección Segura
  │
  ├─→ Ingresar Email (único obligatorio)
  │
  ├─→ Procesar Pago
  │   │
  │   └─→ useCheckoutForm.processPayment()
  │       │
  │       ├─→ API: POST /payment-process-batch
  │       │   (con seat_ids[], email, etc)
  │       │
  │       ├─→ Si es QR:
  │       │   └─→ QRPaymentCard
  │       │       ├─→ API: POST /payment-process-qr
  │       │       ├─→ Generar código QR (QRCode.js)
  │       │       ├─→ PaymentTicketDisplay (muestra ticket y instrucciones)
  │       │       └─→ API: GET /payment-status (monitoreo)
  │       │
  │       ├─→ Si es Terminal:
  │       │   └─→ SmartPointCard
  │       │       ├─→ API: POST /payment-process-terminal
  │       │       ├─→ PaymentTicketDisplay (muestra ticket y instrucciones)
  │       │       └─→ API: GET /terminal-payment-status (monitoreo)
  │       │
  │       └─→ Si es Redirección:
  │           └─→ Redirige a proveedor externo
  │
  └─→ PaymentSuccess o PaymentFailed
      └─→ Confirmation
```

---

### Flujo de Datos del Carrito

```
┌─────────────────────────────────────────────────┐
│      Booking.vue (Selección de Asientos)        │
│   User selecciona asiento → seat_id, seat_label │
└──────────────┬──────────────────────────────────┘
               │
               ▼
      cartStore.addItem({
        id: unique_id,
        seat_id: 12,
        seat_label: "A1",
        screening_id: 1,
        price: 8.00,
        movie_title: "Avatar"
      })
               │
               ▼
┌─────────────────────────────────────────────────┐
│  cartStore (Pinia) - State Global              │
│  items: [seat1, seat2, ...]                    │
│  totalPrice: 16.00                             │
└──────────────┬──────────────────────────────────┘
               │
     ┌─────────┼─────────┐
     ▼         ▼         ▼
Cart.vue  Checkout.vue  Badge
(display) (summary+pay) (count)
```

---

### Flujo de Pago (Detalles)

```
User selecciona "Pago QR"
        ↓
QRPaymentCard monta (onMounted)
        ↓
generateQR() inicia
        ↓
POST /payment-process-qr
{
  payment_provider_id: 1,
  screening_id: 1,
  seat_ids: [5, 6, 7],
  total_price: 24.00,
  seat_count: 3,
  customer_email: "user@gmail.com",
  customer_name: "default"  ← rellenado si vacío
}
        ↓
Backend retorna:
{
  success: true,
  payment_ticket_id: "QR-12345",
  qr_data: "encoded_data"
}
        ↓
PaymentTicketDisplay muestra:
- #QR-12345 (GIGANTE)
- $24.00
- Instrucciones animadas
        ↓
startMonitoring() inicia
        ↓
GET /payment-status/QR-12345 (cada 2 segundos)
        ↓
Si status === 'completed' →
  Payment Success Event emitido
        ↓
Checkout → PaymentSuccess → Confirmation
```

---

## 🔐 Seguridad & Configuración

### Variables de Entorno

```env
VITE_API_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000
VITE_ENABLE_DEBUG=false
```

### Características de Seguridad

- Variables de entorno para URLs sensibles
- CORS manejado por backend
- Local storage solo para datos no sensibles (form data)
- Tokens guardados en memoria (no localStorage)

---

## 🎯 Flujo de Componentes (Component Tree)

```
App.vue
├── Router (Vue Router)
│   ├── Home.vue
│   ├── Movies.vue
│   ├── MovieDetail.vue
│   ├── Booking.vue
│   │   └── Navbar.vue
│   │   ├── ScreeningCard.vue
│   │   ├── SeatMap (custom)
│   │   ├── Cart.vue
│   │   │   ├── MovieCard.vue
│   │   │   └── TicketDetailsCard.vue
│   │   └── Footer.vue
│   │
│   ├── Checkout.vue
│   │   ├── Navbar.vue
│   │   ├── Payment Form
│   │   │   ├── PaymentMethodSelector.vue
│   │   │   │   └── variant-options
│   │   │   ├── (QR selected)
│   │   │   │   └── QRPaymentCard.vue
│   │   │   │       ├── PaymentTicketDisplay.vue ⭐
│   │   │   │       └── QR Canvas
│   │   │   │
│   │   │   └── (Terminal selected)
│   │   │       └── SmartPointCard.vue
│   │   │           └── PaymentTicketDisplay.vue ⭐
│   │   │
│   │   ├── Order Summary
│   │   │   └── order-items, totals
│   │   └── Footer.vue
│   │
│   ├── PaymentSuccess.vue
│   ├── PaymentFailed.vue
│   ├── Confirmation.vue
│   ├── MyTickets.vue
│   └── NotFound.vue
│
└── Footer.vue (global)
```

---

## 📊 Modelos de Datos

### Ticket
```javascript
{
  id: number,
  screen_id: number,
  seat_id: number,
  seat_label: string,
  screening_id: number,
  movie_title: string,
  price: number,
  status: 'available' | 'unavailable' | 'reserved',
  created_at: timestamp
}
```

### Payment
```javascript
{
  id: number,
  payment_ticket_id: string,
  payment_provider_id: number,
  screening_id: number,
  seat_ids: number[],
  customer_email: string,
  customer_name: string,
  total_amount: number,
  status: 'pending' | 'completed' | 'failed' | 'cancelled',
  created_at: timestamp
}
```

### PaymentProvider
```javascript
{
  id: number,
  name: string,  // 'Mercado Pago', 'Stripe', etc
  description: string,
  icon: string,
  requires_redirect: boolean,
  methods: string[],  // ['qr', 'terminal', 'redirect']
  active: boolean
}
```

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **Vue.js 3** - Framework principal
- **Vite** - Build tool y dev server
- **Vue Router** - Enrutamiento SPA
- **Pinia** - State management
- **Axios** - Cliente HTTP
- **QRCode.js** - Generación de códigos QR
- **Tailwind CSS / Custom CSS** - Estilos

### Build & Deploy
- **Node.js** - Runtime
- **npm** - Package manager
- **Vite** - Bundler

---

## 📌 Notas Importantes

### Flujo de Checkout  
1. **Email es el único campo obligatorio**
2. Si está vacío, se completa con `default@gmail.com`
3. Nombre y teléfono se completan con `default` y `000000` respectivamente

### Método de Pago
1. Selecciona **Mercado Pago** como proveedor
2. Elige entre:
   - **QR**: Escanea con tu teléfono
   - **Terminal Smart Point**: Acerca tu tarjeta
   - **Redirección Segura**: Paga en sitio seguro

### Componente PaymentTicketDisplay
- Se muestra **automáticamente** cuando se inicia un pago
- Muestra el **número de transacción gigante**
- Display **instrucciones animadas** paso a paso
- Indicador **dinámico** del estado

### Monitoreo de Pagos
- QR: Monitorea cada 2 segundos por 5 minutos
- Terminal: Monitorea cada 1.5 segundos
- Si hay timeout, permite reintentar
- Fallback: Genera IDs locales si backend no responde

---

## 🔗 URLs API Completa

```
Base: http://localhost:8000/api

PAYMENT
  GET  /payment-providers
  GET  /payment-providers/:id
  POST /payment-process
  POST /payment-process-batch
  POST /payment-process-qr
  POST /payment-process-terminal
  GET  /payment-status/:id
  GET  /terminal-payment-status/:id
  POST /payment-cancel/:id
  POST /validate-payment-session

MOVIES
  GET  /movies
  GET  /movies/:id

CINEMAS
  GET  /cinemas
  GET  /cinemas/:id

SCREENINGS
  GET  /screenings
  GET  /screenings/:id
  GET  /screenings/:id/seats

SEATS
  GET  /seats/:id
  PUT  /seats/:id

TICKETS
  GET  /tickets
  GET  /tickets/:id
  POST /tickets

METHODS
  GET  /payment-methods
  GET  /payment-methods/:method/providers
```

---

## 📞 Soporte

Para consultas sobre la arquitectura o APIs, revisar:
- Logs en browser console
- Network tab en DevTools
- Comentarios en el código fuente
