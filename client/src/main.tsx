import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AppKitWrapper from './connection/AppkitWrapper.tsx'
import { BrowserRouter as Router} from 'react-router-dom'
import { Toaster } from 'react-hot-toast'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#e2e8f0',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            fontSize: '14px',
            fontFamily: 'Outfit, sans-serif',
            padding: '12px 16px',
            maxWidth: '360px',
          },
          success: {
            iconTheme: { primary: '#a855f7', secondary: '#0f172a' },
            style: {
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              color: '#e2e8f0',
            },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#0f172a' },
            style: {
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              color: '#e2e8f0',
            },
          },
          loading: {
            iconTheme: { primary: '#a855f7', secondary: 'rgba(168, 85, 247, 0.2)' },
            style: {
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
            },
          },
        }}
      />
      <AppKitWrapper>
        <App />
      </AppKitWrapper>
    </Router>
  </StrictMode>,
)
