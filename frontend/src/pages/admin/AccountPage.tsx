import { useEffect, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Lock, Mail, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { extractErrorMessage } from '@/api/client'
import { useAuth } from '@/context/AuthContext'

export default function AccountPage() {
  const { user, updateUser } = useAuth()
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) setEmail(user.email)
  }, [user])

  const saveMutation = useMutation({
    mutationFn: () =>
      authApi.updateProfile({
        email: email.trim(),
        current_password: currentPassword,
        ...(password
          ? { password, password_confirmation: passwordConfirm }
          : {}),
      }),
    onSuccess: (updated) => {
      updateUser(updated)
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirm('')
      toast.success('Compte mis à jour')
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error('Saisissez votre mot de passe actuel pour confirmer.')
      return
    }
    if (password && password !== passwordConfirm) {
      toast.error('La confirmation du nouveau mot de passe ne correspond pas.')
      return
    }
    saveMutation.mutate()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Compte</h2>
        <p className="text-sm text-ink-muted">
          Modifiez votre adresse e-mail et votre mot de passe de connexion.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="admin-card space-y-6 rounded-xl p-6">
        {/* Email */}
        <div>
          <label htmlFor="account-email" className="mb-1.5 block text-sm font-medium text-ink-soft">
            Adresse e-mail
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              id="account-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input pl-10"
              placeholder="admin@example.com"
            />
          </div>
        </div>

        <div className="border-t border-line" />

        {/* New password */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="account-new" className="mb-1.5 block text-sm font-medium text-ink-soft">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                id="account-new"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input pl-10"
                placeholder="Laisser vide pour ne pas changer"
                autoComplete="new-password"
              />
            </div>
          </div>
          <div>
            <label htmlFor="account-confirm" className="mb-1.5 block text-sm font-medium text-ink-soft">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                id="account-confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="field-input pl-10"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>
        <p className="-mt-2 text-xs text-ink-muted">
          8 caractères minimum. Modifier le mot de passe déconnecte vos autres sessions.
        </p>

        <div className="border-t border-line" />

        {/* Current password (confirmation) */}
        <div>
          <label htmlFor="account-current" className="mb-1.5 block text-sm font-medium text-ink-soft">
            Mot de passe actuel <span className="text-ink-muted">(obligatoire pour valider)</span>
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              id="account-current"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="field-input pl-10"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="btn-primary flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}
