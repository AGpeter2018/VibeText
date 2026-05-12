import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AppKitWrapper from './connection/AppkitWrapper.tsx'
import { BrowserRouter as Router} from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AppKitWrapper>
        <App />
      </AppKitWrapper>
    </Router>
  </StrictMode>,
)
