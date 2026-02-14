<template>
  <div class="app">
    <Navbar />
    <main class="main-content">
      <RouterView />
    </main>
    <Footer />
    <Diagnostics />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import Diagnostics from './components/Diagnostics.vue'
import { appConfig } from './config/appConfig'
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(90deg, v-bind("appConfig.colors.background.gradient.start") 0%, v-bind("appConfig.colors.background.gradient.end") 100%);
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}
</style>
