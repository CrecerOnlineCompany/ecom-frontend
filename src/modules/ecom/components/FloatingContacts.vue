<template>
  <div class="floating-socials" aria-label="Redes sociales">
    <a v-if="instagram" :href="instagram" target="_blank" rel="noreferrer" aria-label="Instagram">◎</a>
    <a v-if="facebook" :href="facebook" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
    <a v-if="tiktok" :href="tiktok" target="_blank" rel="noreferrer" aria-label="TikTok">♪</a>
    <a v-if="youtube" :href="youtube" target="_blank" rel="noreferrer" aria-label="YouTube">▶</a>
  </div>
  <a v-if="whatsapp" class="whatsapp" :href="whatsapp" target="_blank" rel="noreferrer" aria-label="WhatsApp">✆</a>
</template>

<script setup>
const phone = String(import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '')
const message = encodeURIComponent(import.meta.env.VITE_WHATSAPP_MESSAGE || 'Hola, quiero consultar por un producto.')
const whatsapp = phone ? `https://wa.me/${phone}?text=${message}` : ''
const instagram = import.meta.env.VITE_INSTAGRAM_URL || ''
const facebook = import.meta.env.VITE_FACEBOOK_URL || ''
const tiktok = import.meta.env.VITE_TIKTOK_URL || ''
const youtube = import.meta.env.VITE_YOUTUBE_URL || ''
</script>

<style scoped>
.floating-socials{position:fixed;right:18px;bottom:105px;z-index:70;background:#fff;border:1px solid var(--border);border-radius:999px;padding:8px;display:flex;flex-direction:column;gap:7px;box-shadow:var(--shadow)}.floating-socials:empty{display:none}.floating-socials a,.whatsapp{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;font-weight:900;font-size:1.15rem}.floating-socials a{background:#fff;color:#4f46e5}.whatsapp{position:fixed;right:18px;bottom:40px;z-index:71;background:#22c55e;color:#fff;width:56px;height:56px;font-size:1.6rem;box-shadow:0 12px 28px rgba(34,197,94,.35)}@media(max-width:760px){.floating-socials{right:12px;bottom:122px}.whatsapp{right:12px;bottom:56px}}
</style>