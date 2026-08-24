import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/modules/ecom/pages/HomePage.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/modules/auth/pages/LoginPage.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/modules/auth/pages/RegisterPage.vue'),
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('@/modules/auth/pages/AccountPage.vue'),
  },
  {
    path: '/account/orders',
    name: 'MyOrders',
    component: () => import('@/modules/auth/pages/MyOrdersPage.vue'),
  },
  {
    path: '/products/:slug',
    name: 'Product',
    component: () => import('@/modules/ecom/pages/ProductPage.vue'),
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/modules/ecom/pages/CartPage.vue'),
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/modules/ecom/pages/CheckoutPage.vue'),
  },
  {
    path: '/checkout/result',
    name: 'CheckoutResult',
    component: () => import('@/modules/ecom/pages/CheckoutResultPage.vue'),
  },
  {
    path: '/orders/:orderNumber',
    name: 'Order',
    component: () => import('@/modules/ecom/pages/OrderPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/modules/ecom/pages/NotFoundPage.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
