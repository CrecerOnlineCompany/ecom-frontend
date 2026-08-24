# Arquitectura (Frontend)

## Objetivo
Mantener el frontend desacoplado del dominio “cine/tickets” y centrado en ecommerce.

## Capas
- **UI (pages/components)**: `frontend/src/modules/ecom/pages`, `frontend/src/modules/ecom/components`
- **Estado**: `frontend/src/modules/ecom/stores/cartStore.js`
- **Servicios**: `frontend/src/modules/ecom/services/ecomApi.js` (usa `frontend/src/services/api.js`)

## API
Todos los requests incluyen `X-Store-Slug` para resolver contexto de tienda (middleware `store.context`).

