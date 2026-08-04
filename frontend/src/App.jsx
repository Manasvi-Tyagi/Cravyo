import React from 'react'
import './styles/theme.css'
import './styles/ui.css'
import './styles/auth.css'
import './styles/pages.css'
import { ToastProvider } from './components/ui'
import AppRoutes from './routes/AppRoutes.jsx'

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  )
}

export default App
