import { Toaster } from 'react-hot-toast'

/** App-wide toast host, themed to match the light UI. */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#ffffff',
          color: '#1c1917',
          border: '1px solid #e7e5e4',
          boxShadow: '0 4px 16px -6px rgba(28,25,23,0.18)',
          borderRadius: '10px',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#047857', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#dc2626', secondary: '#fff' },
        },
      }}
    />
  )
}
