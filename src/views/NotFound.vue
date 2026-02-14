<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>Página No Encontrada</h1>
        <p>Lo siento, la página que buscas no existe.</p>

        <div class="suggestions">
          <p>Aquí hay algunos enlaces útiles:</p>
          <ul>
            <li><router-link to="/">Ir al Inicio</router-link></li>
            <li><router-link to="/movies">Ver Películas</router-link></li>
            <li><router-link to="/my-tickets">Mis Entradas</router-link></li>
          </ul>
        </div>

        <div class="cta">
          <router-link to="/" class="btn btn-primary">Volver al Inicio</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Empty script - static component
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.not-found-content {
  text-align: center;
}

.error-code {
  font-size: 10rem;
  font-weight: 900;
  color: rgba(102, 126, 234, 0.1);
  line-height: 1;
  margin: -2rem 0 1rem 0;
}

.not-found-content h1 {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.not-found-content p {
  font-size: 1.1rem;
  color: #ccc;
  margin-bottom: 2rem;
}

.suggestions {
  background: #2d2d2d;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
  margin-bottom: 2rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.suggestions p {
  margin: 0 0 1rem 0;
}

.suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions li {
  margin-bottom: 0.75rem;
}

.suggestions a {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.3s ease;
  font-weight: 500;
}

.suggestions a:hover {
  color: #fff;
}

.cta {
  padding: 2rem;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
    margin: -1rem 0 1rem 0;
  }

  .not-found-content h1 {
    font-size: 1.8rem;
  }

  .not-found-content p {
    font-size: 1rem;
  }

  .suggestions {
    padding: 1.5rem;
  }
}
</style>
