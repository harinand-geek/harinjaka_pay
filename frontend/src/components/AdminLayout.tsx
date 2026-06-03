import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCog,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/payment-methods', label: 'Méthodes', icon: CreditCard, end: false },
  { to: '/admin/settings', label: 'Paramètres', icon: Settings, end: false },
  { to: '/admin/account', label: 'Compte', icon: UserCog, end: false },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Déconnecté')
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-line bg-surface transition-transform md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg ring-1 ring-line">
            <img src="/digitalsub_icon.png" alt="Digital Subscription Madagascar" className="h-10 w-10 object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-ink">Digital Subscription</p>
            <p className="text-xs text-ink-muted">Administration</p>
          </div>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3.5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-ink-soft hover:bg-surface-2 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="text-base font-semibold text-ink">Administration</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-soft sm:block">{user?.email}</span>
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-ink-soft transition hover:bg-surface-2 hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
