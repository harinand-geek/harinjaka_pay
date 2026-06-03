import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import ToastProvider from '@/components/ToastProvider'
import DynamicBackground from '@/components/DynamicBackground'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <DynamicBackground />
          <RouterProvider router={router} />
          <ToastProvider />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
