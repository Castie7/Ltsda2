import { createApp } from 'vue'
import './style.css' // Ensure this points to the file with @import "tailwindcss"
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')