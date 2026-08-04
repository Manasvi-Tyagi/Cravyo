import React from 'react'
import { ToastContext } from './ToastContext'

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])

  const showToast = React.useCallback((message, options = {}) => {
    const id = ++idCounter
    const toast = { id, message, tone: options.tone || 'success', linkLabel: options.linkLabel, onLinkClick: options.onLinkClick }
    setToasts((current) => [...current, toast])
    const duration = options.duration ?? 2500
    if (duration > 0) {
      window.setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id))
      }, duration)
    }
    return id
  }, [])

  const dismissToast = React.useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const value = React.useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" role="status">
        {toasts.map((toast) => (
          <div key={toast.id} className={['toast', toast.tone === 'error' ? 'toast-error' : ''].filter(Boolean).join(' ')}>
            <span>{toast.message}</span>
            {toast.linkLabel && (
              <a href="#" onClick={(e) => { e.preventDefault(); toast.onLinkClick?.(); dismissToast(toast.id) }}>
                {toast.linkLabel}
              </a>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
