import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import './styles/touch-screen.css'
import configPlugin from './plugins/configPlugin'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(configPlugin)

app.mount('#app')
