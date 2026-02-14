import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/movies',
    name: 'Movies',
    component: () => import('../views/Movies.vue')
  },
  {
    path: '/movie/:id',
    name: 'MovieDetail',
    component: () => import('../views/MovieDetail.vue')
  },
  {
    path: '/booking/:id',
    name: 'Booking',
    component: () => import('../views/Booking.vue')
  },
  {
    path: '/confirmation/:ticketNumbers',
    name: 'Confirmation',
    component: () => import('../views/Confirmation.vue')
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue')
  },
  {
    path: '/payment-success',
    name: 'PaymentSuccess',
    component: () => import('../views/PaymentSuccess.vue')
  },
  {
    path: '/payment-failed',
    name: 'PaymentFailed',
    component: () => import('../views/PaymentFailed.vue')
  },
  {
    path: '/my-tickets',
    name: 'MyTickets',
    component: () => import('../views/MyTickets.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
