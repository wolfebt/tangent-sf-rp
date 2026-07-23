import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './css/dbm-style.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { CampaignProvider } from './context/CampaignContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CampaignProvider>
        <App />
      </CampaignProvider>
    </AuthProvider>
  </React.StrictMode>,
)
