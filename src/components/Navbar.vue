<template>
  <nav class="navbar">
    <div class="container navbar-container">
      <RouterLink to="/" class="navbar-brand">
        <h1 class="mb-0">CINELAR</h1>
      </RouterLink>

      <div class="navbar-menu">
        <RouterLink to="/" class="nav-link">Inicio</RouterLink>
        <RouterLink to="/movies" class="nav-link">Películas</RouterLink>
      </div>

      <button @click="toggleMenu" class="navbar-toggle">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
</script>

<style scoped>
.navbar {
  background-color: #000000af !important;
  border-bottom: 4px solid var(--primary);
  padding: 0.1rem 0;                       /* Más padding */
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-lg);
  -webkit-tap-highlight-color: transparent;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.navbar-brand {
  display: flex;
  align-items: center;
  color: var(--primary);
  text-decoration: none;
  font-size: 1rem;                         /* Más grande para TOTEM */
  font-weight: bold;
  padding: 2px 12px;
  border-radius: var(--border-radius);
  transition: var(--transition);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  min-height: 56px;                        /* Mínimo para touch */
}

.navbar-brand:hover,
.navbar-brand:active {
  background: rgba(102, 126, 234, 0.1);
  transform: scale(1.02);
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 2.5rem;                             /* Más espacio */
}

.nav-link {
  color: #ccc;
  text-decoration: none;
  transition: var(--transition);
  font-weight: 500;
  font-size: 1.2rem;                       /* Más grande */
  padding: 12px 20px;                      /* Área táctil más grande */
  border-radius: var(--border-radius);
  min-height: 20px;
  display: flex;
  align-items: center;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.nav-link:hover,
.nav-link:active,
.nav-link.router-link-active {
  color: var(--primary);
  background: rgba(102, 126, 234, 0.1);
  transform: scale(1.05);
}

.navbar-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: var(--border-radius);
  min-height: 56px;
  min-width: 56px;
  justify-content: center;
  align-items: center;
  -webkit-tap-highlight-color: transparent;
}

.navbar-toggle:hover,
.navbar-toggle:active {
  background: rgba(102, 126, 234, 0.1);
}

.navbar-toggle span {
  width: 30px;                             /* Más ancho */
  height: 4px;                             /* Más grueso */
  background-color: var(--primary);
  border-radius: var(--border-radius-sm);
  transition: var(--transition);
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.75rem 0;
  }

  .navbar-container {
    padding: 0 1rem;
    flex-wrap: wrap;
  }

  .navbar-brand {
    font-size: 1.3rem;
  }

  .navbar-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #1a1a1a;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border-bottom: 1px solid #3d3d3d;
    width: 100%;
    z-index: 100;
  }

  .navbar-menu.active {
    display: flex;
  }

  .navbar-menu a {
    padding: 0.6rem 0;
    font-size: 0.95rem;
  }

  .navbar-toggle {
    display: flex;
    gap: 0.4rem;
  }

  .navbar-toggle span {
    width: 25px;
    height: 3px;
  }

  .navbar-actions {
    gap: 0.5rem;
  }

  .navbar-actions a,
  .navbar-actions button {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }

  .cart-count {
    font-size: 0.65rem;
    min-width: 18px;
    height: 18px;
    line-height: 18px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.6rem 0;
  }

  .navbar-container {
    padding: 0 0.75rem;
    gap: 0.5rem;
  }

  .navbar-brand {
    font-size: 1.1rem;
  }

  .navbar-menu {
    gap: 0.5rem;
    padding: 0.75rem;
    top: 55px;
  }

  .navbar-menu a {
    padding: 0.5rem 0;
    font-size: 0.85rem;
  }

  .navbar-toggle {
    gap: 0.3rem;
  }

  .navbar-toggle span {
    width: 22px;
    height: 2.5px;
  }

  .navbar-actions {
    gap: 0.35rem;
  }

  .navbar-actions a,
  .navbar-actions button {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  .cart-count {
    font-size: 0.6rem;
    min-width: 16px;
    height: 16px;
    line-height: 16px;
  }
}
</style>
