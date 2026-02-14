<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h4>CINELAR </h4>
          <p>Plataforma de venta de entradas de cine online. Acceso rápido a funciones, películas y reservas.</p>
        </div>
        <div class="footer-section">
          <h4>Enlaces</h4>
          <ul>
            <li><RouterLink to="/">Inicio</RouterLink></li>
            <li><RouterLink to="/movies">Películas</RouterLink></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Contacto</h4>
          <p>Email: info@cinea.com.ar</p>
          <p>Teléfono: +34 91 123 4567</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 CINELAR. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { appConfig } from '../config/appConfig'
</script>

<style scoped>
.footer {
  background: linear-gradient(90deg, v-bind("appConfig.colors.background.gradient.start") 0%, v-bind("appConfig.colors.background.gradient.end") 100%);
  border-top: 1px solid #3d3d3d;
  margin-top: 4rem;
  padding: 2rem 0;
  color: #ccc;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  color: var(--primary);
  margin-bottom: 1rem;
}

.footer-section p {
  color: #999;
  margin-bottom: 0.5rem;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #ccc;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: var(--primary);
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #3d3d3d;
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .footer {
    margin-top: 3rem;
    padding: 1.5rem 0;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .footer-section h4 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .footer-section p {
    font-size: 0.9rem;
    margin-bottom: 0.35rem;
  }

  .footer-section ul li {
    margin-bottom: 0.35rem;
  }

  .footer-section a {
    font-size: 0.9rem;
  }

  .footer-bottom {
    padding-top: 1.5rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .footer {
    margin-top: 2rem;
    padding: 1rem 0;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .footer-section h4 {
    font-size: 0.95rem;
    margin-bottom: 0.6rem;
  }

  .footer-section p {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }

  .footer-section ul li {
    margin-bottom: 0.25rem;
  }

  .footer-section a {
    font-size: 0.8rem;
  }

  .footer-bottom {
    padding-top: 1rem;
    font-size: 0.75rem;
    color: #555;
  }
}
</style>
