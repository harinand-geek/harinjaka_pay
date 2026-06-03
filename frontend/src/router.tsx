/* eslint-disable react-refresh/only-export-components -- this is the route map, not a component module */
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import PaymentPage from '@/pages/public/PaymentPage'
import ProtectedRoute from '@/components/ProtectedRoute'

// Admin bundle (incl. charts) is code-split so public visitors never load it.
const AdminLayout = lazy(() => import('@/components/AdminLayout'))
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const PaymentMethodsPage = lazy(() => import('@/pages/admin/PaymentMethodsPage'))
const PaymentMethodFormPage = lazy(() => import('@/pages/admin/PaymentMethodFormPage'))
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'))
const AccountPage = lazy(() => import('@/pages/admin/AccountPage'))

function Lazy({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-ink-muted">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PaymentPage />,
  },
  {
    path: '/admin/login',
    element: (
      <Lazy>
        <LoginPage />
      </Lazy>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: (
          <Lazy>
            <AdminLayout />
          </Lazy>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'payment-methods', element: <PaymentMethodsPage /> },
          { path: 'payment-methods/new', element: <PaymentMethodFormPage /> },
          { path: 'payment-methods/:id/edit', element: <PaymentMethodFormPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'account', element: <AccountPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
