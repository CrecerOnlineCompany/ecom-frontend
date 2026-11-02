<template>
  <div class="app-shell">
    <AppHeader />
    <main class="app-main"><RouterView /></main>
    <FloatingContacts />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppHeader from '@/modules/ecom/components/AppHeader.vue'
import FloatingContacts from '@/modules/ecom/components/FloatingContacts.vue'
</script>

<style scoped>
.app-shell{min-height:100vh;display:flex;flex-direction:column}.app-main{flex:1;padding:0 0 48px}
</style>