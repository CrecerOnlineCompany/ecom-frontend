# Ecom Frontend (Vue 3 + Vite)

SPA para el ecommerce (catálogo + carrito + checkout) consumiendo el backend en `/api/ecom/*`.

## Requisitos
- Node 16+

## Variables de entorno
- `VITE_API_URL` (default: `http://localhost:8000/api`)
- `VITE_STORE_SLUG` (default: `demo-store`) — se envía como header `X-Store-Slug`

## Comandos
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`

## Rutas
- `/` Home (catálogo)
- `/products/:slug` Producto
- `/cart` Carrito
- `/checkout` Checkout
- `/checkout/result` Resultado (Mercado Pago redirect)
- `/orders/:orderNumber` Orden

## Estructura
- `frontend/src/modules/ecom/services/ecomApi.js` cliente API ecommerce
- `frontend/src/modules/ecom/stores/cartStore.js` estado de carrito (Pinia + localStorage)
- `frontend/src/modules/ecom/pages/*` páginas (Home/Product/Cart/Checkout/Order)

