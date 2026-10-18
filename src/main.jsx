import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './css/dbm-style.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { ConfirmProvider } from './context/ConfirmContext.jsx'
import { AudioProvider } from './context/AudioContext.jsx'
import { ErrorBoundary } from './components/UI/ErrorBoundary.jsx'
import { TelemetryService } from './services/telemetryService'
import { registerSW } from 'virtual:pwa-register'

TelemetryService.initialize();

// Catch Vite dynamic module preload errors (stale chunk hashes post-deployment)
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('[Vite] Dynamic import preload error detected (stale deployment chunk):', event);
    const reloadKey = 'tangent_vite_preload_reload';
    const lastReload = sessionStorage.getItem(reloadKey);
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
      sessionStorage.setItem(reloadKey, now.toString());
      window.location.reload();
    }
  });
}

if (import.meta.env.PROD) {
  registerSW({ immediate: true })
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <ConfirmProvider>
          <AudioProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </AudioProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
