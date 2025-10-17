import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'


// Filtrar warnings específicos solo en desarrollo
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('defaultProps will be removed')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

createRoot(document.getElementById('root')).render(
  <App />
)
