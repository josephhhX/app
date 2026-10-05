import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Keep installed PWAs on the latest visual and functional version.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
