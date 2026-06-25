import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(<App />)

// Register the service worker for offline / installable PWA support.
if ('serviceWorker' in navigator) {
  // When an updated service worker takes control, reload once so the freshest
  // build is shown immediately (guarded against reload loops).
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })
  window.addEventListener('load', () => {
    const swUrl = new URL('sw.js', document.baseURI).href
    navigator.serviceWorker.register(swUrl).then((reg) => {
      reg.update().catch(() => {})
    }).catch(() => {})
  })
}
