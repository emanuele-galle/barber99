'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  title?: string
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    iconColor: 'text-green-500',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    iconColor: 'text-yellow-500',
  },
  info: {
    icon: Info,
    bgColor: 'bg-[#d4a855]/10',
    borderColor: 'border-[#d4a855]/30',
    iconColor: 'text-[#d4a855]',
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, message, title }])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-24 md:bottom-8 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const config = toastConfig[toast.type]
            const Icon = config.icon

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`
                  pointer-events-auto
                  ${config.bgColor} ${config.borderColor}
                  border rounded-lg p-4 backdrop-blur-sm
                  shadow-lg shadow-black/20
                `}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    {toast.title && (
                      <p className="text-white font-semibold text-sm mb-1">
                        {toast.title}
                      </p>
                    )}
                    <p className="text-white/80 text-sm">{toast.message}</p>
                  </div>
                  <button
                    onClick={() => hideToast(toast.id)}
                    className="text-white/40 hover:text-white transition-colors shrink-0"
                    aria-label="Chiudi notifica"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
