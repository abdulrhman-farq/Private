import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// حاجز أخطاء بسيط: يمنع الشاشة البيضاء عند أي خطأ غير متوقّع ويوفّر استعادة.
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { try { console.error('App error:', error, info) } catch (e) {} }
  reset() { this.setState({ error: null }) }
  reload() { try { window.location.reload() } catch (e) {} }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic',sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 28, background: '#15101A', color: '#F4EAF0', textAlign: 'center' }}>
        <div style={{ fontSize: 44 }}>🤍</div>
        <h2 style={{ margin: 0 }}>حدث خطأ غير متوقّع</h2>
        <p style={{ color: '#A892A0', fontSize: 14, lineHeight: 1.7, maxWidth: 320, margin: 0 }}>بياناتكِ محفوظة. جرّبي إعادة المحاولة، وإن استمرّ الخطأ أعيدي تحميل التطبيق.</p>
        <button onClick={() => this.reset()} style={{ border: 'none', cursor: 'pointer', background: 'linear-gradient(140deg,#EC7A99,#C24E72)', color: '#fff', borderRadius: 16, padding: '14px 24px', fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }}>إعادة المحاولة</button>
        <button onClick={() => this.reload()} style={{ border: 'none', cursor: 'pointer', background: 'none', color: '#F08FA8', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>إعادة تحميل التطبيق</button>
      </div>
    )
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary><App /></ErrorBoundary>
)

// Register the service worker for offline / installable PWA support.
// Skip inside the native iOS/Capacitor shell: assets are already served
// natively there, and a network-first SW can cause reload loops.
const isNativeApp = !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform())
if (!isNativeApp && 'serviceWorker' in navigator) {
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
