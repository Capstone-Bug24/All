import { createContext, useContext, useState, useCallback } from 'react'

// Toast 컴포넌트 스타일
const toastStyles = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 9999,
  minWidth: '300px',
  padding: '16px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  animation: 'slideIn 0.3s ease-out',
  color: 'white',
  fontSize: '14px',
  fontWeight: '500',
}

const toastVariants = {
  default: {
    backgroundColor: '#333',
  },
  destructive: {
    backgroundColor: '#ff4d4f',
  },
  success: {
    backgroundColor: '#52c41a',
  },
}

// Toast 컴포넌트
function Toast({ title, description, variant = 'default', onClose }) {
  const variantStyle = toastVariants[variant] || toastVariants.default

  return (
    <div
      style={{
        ...toastStyles,
        ...variantStyle,
      }}
    >
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {title}
          </div>
        )}
        {description && <div>{description}</div>}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          marginLeft: '12px',
          padding: '0',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </button>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  )
}

// Toast 컨테이너 컴포넌트
function ToastContainer({ toasts, removeToast }) {
  return (
    <div>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            top: `${20 + index * 80}px`,
            right: '20px',
            zIndex: 9999 + index,
          }}
        >
          <Toast
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

// Toast Context
const ToastContext = createContext(null)

// ToastProvider 컴포넌트
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 3000 }) => {
      const id = Date.now() + Math.random()
      const newToast = { id, title, description, variant }

      setToasts((prev) => [...prev, newToast])

      // 자동으로 제거
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    },
    []
  )

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// useToast hook
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
