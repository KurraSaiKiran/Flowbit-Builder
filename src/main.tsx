/**
 * main.tsx
 * Application entry point.
 *
 * Wraps the app in:
 *   - StrictMode   — catches side-effect issues during development
 *   - BrowserRouter — enables client-side routing via React Router
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
