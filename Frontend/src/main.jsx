import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import clearTestDataOnStart from './utils/clearTestDataOnStart'

// Limpiar datos de prueba al iniciar (solo en desarrollo)
clearTestDataOnStart();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
