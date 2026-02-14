<template>
  <div class="qr-card" v-if="qrCodes.length > 0">
    <h3>Códigos QR</h3>
    <p class="qr-info">Escanea cualquiera de estos códigos en la entrada al cine</p>
    
    <div class="qr-grid">
      <div v-for="(qr, index) in qrCodes" :key="index" class="qr-item">
        <div class="qr-code-container">
          <canvas :ref="`qrCanvas${index}`" class="qr-canvas"></canvas>
        </div>
        <p class="qr-label">{{ qr.seat_code }}</p>
        <button @click="copyQR(qr.qr_code)" class="btn-copy">
          📋 Copiar código
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import QRCode from 'qrcode'

defineProps({
  qrCodes: {
    type: Array,
    required: true
  }
})

onMounted(async () => {
  for (let i = 0; i < qrCodes.length; i++) {
    try {
      const canvas = document.querySelector(`canvas[ref="qrCanvas${i}"]`)
      if (!canvas) {
        // Buscar por clase si ref no funciona
        const canvases = document.querySelectorAll('.qr-canvas')
        if (canvases[i]) {
          await QRCode.toCanvas(canvases[i], qrCodes[i].qr_code, {
            width: 200,
            margin: 10,
            color: {
              dark: '#000',
              light: '#fff'
            }
          })
        }
      } else {
        await QRCode.toCanvas(canvas, qrCodes[i].qr_code, {
          width: 200,
          margin: 10,
          color: {
            dark: '#000',
            light: '#fff'
          }
        })
      }
    } catch (err) {
      console.error('Error generando QR:', err)
    }
  }
})

const copyQR = (qr) => {
  navigator.clipboard.writeText(qr).then(() => {
    alert('Código QR copiado al portapapeles')
  }).catch(() => {
    alert('Error al copiar')
  })
}
</script>

<style scoped>
.qr-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.qr-card h3 {
  margin-top: 0;
  color: #333;
}

.qr-info {
  color: #666;
  margin: 1rem 0;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 1.5rem;
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid #eee;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.qr-item:hover {
  border-color: #667eea;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 1rem;
  min-width: 220px;
  min-height: 220px;
}

.qr-canvas {
  max-width: 100%;
  height: auto;
}

.qr-label {
  font-weight: bold;
  color: #333;
  margin: 0.5rem 0;
  font-size: 1.2rem;
}

.btn-copy {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
  width: 100%;
}

.btn-copy:hover {
  background: #764ba2;
}

@media (max-width: 768px) {
  .qr-grid {
    grid-template-columns: 1fr;
  }

  .qr-code-container {
    min-width: 150px;
    min-height: 150px;
  }
}
</style>
