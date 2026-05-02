import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './CartContext' 

// 2. Usamos una sola vez el createRoot
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 3. Envolvemos la App con el Provider */}
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
)