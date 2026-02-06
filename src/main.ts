import { createApp } from 'vue'
import './style.css'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router'
import i18n from './utils/i18n/index.js'

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
