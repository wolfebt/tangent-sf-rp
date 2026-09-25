import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './css/dbm-style.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { ConfirmProvider } from './context/ConfirmContext.jsx'
import { AudioProvider } from './context/AudioContext.jsx'
import { registerSW } from 'virtual:pwa-register'

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
    <ToastProvider>
      <ConfirmProvider>
        <AudioProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AudioProvider>
      </ConfirmProvider>
    </ToastProvider>
  </React.StrictMode>,
)
