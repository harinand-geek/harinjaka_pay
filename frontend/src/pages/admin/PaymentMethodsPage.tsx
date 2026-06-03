import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { paymentMethodsApi } from '@/api/paymentMethods'
import { extractErrorMessage } from '@/api/client'
import { hasLogo, methodGradient, TYPE_LABELS } from '@/lib/paymentVisuals'
import type { PaymentMethodWithStats } from '@/types/payment'
import ConfirmModal from '@/components/ConfirmModal'
import MethodIcon from '@/components/MethodIcon'

export default function PaymentMethodsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [toDelete, setToDelete] = useState<PaymentMethodWithStats | null>(null)

  const { data: methods, isLoading, isError } = useQuery({
    queryKey: ['admin-payment-methods'],
    queryFn: paymentMethodsApi.listAdmin,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => paymentMethodsApi.toggle(id),
    onSuccess: () => {
      toast.success('Statut mis à jour')
      void invalidate()
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => paymentMethodsApi.remove(id),
    onSuccess: () => {
      toast.success('Méthode supprimée')
      setToDelete(null)
      void invalidate()
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  const reorderMutation = useMutation({
    mutationFn: (order: number[]) => paymentMethodsApi.reorder(order),
    onSuccess: () => void invalidate(),
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  const sorted = useMemo(
    () => (methods ? [...methods].sort((a, b) => a.sort_order - b.sort_order) : []),
    [methods],
  )

  const filtered = useMemo(
    () =>
      sorted.filter((m) =>
        `${m.name} ${m.slug} ${m.badge ?? ''}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [sorted, search],
  )

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= sorted.length) return
    const ids = sorted.map((m) => m.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    reorderMutation.mutate(ids)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">Méthodes de paiement</h2>
          <p className="text-sm text-ink-muted">
            Gérez les méthodes affichées sur la page publique.
          </p>
        </div>
        <Link
          to="/admin/payment-methods/new"
          className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="field-input pl-9"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-16 text-ink-muted">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="admin-card rounded-xl p-8 text-center text-red-600">
          Impossible de charger les méthodes.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="admin-card overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-surface-2 text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Ordre</th>
                  <th className="px-4 py-3">Méthode</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Vues</th>
                  <th className="px-4 py-3">Copies</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-ink">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-ink-muted">
                      Aucune méthode trouvée.
                    </td>
                  </tr>
                )}
                {filtered.map((m) => {
                  const realIndex = sorted.findIndex((x) => x.id === m.id)
                  return (
                    <tr key={m.id} className="border-t border-line hover:bg-surface-2">
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => move(realIndex, -1)}
                            disabled={realIndex === 0 || reorderMutation.isPending || search !== ''}
                            className="rounded p-1 text-ink-muted hover:bg-surface-2 hover:text-ink disabled:opacity-30"
                            aria-label="Monter"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => move(realIndex, 1)}
                            disabled={
                              realIndex === sorted.length - 1 ||
                              reorderMutation.isPending ||
                              search !== ''
                            }
                            className="rounded p-1 text-ink-muted hover:bg-surface-2 hover:text-ink disabled:opacity-30"
                            aria-label="Descendre"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg p-1.5 ${
                              hasLogo(m) ? 'bg-white ring-1 ring-line' : 'ring-1 ring-line'
                            }`}
                            style={hasLogo(m) ? undefined : { background: methodGradient(m.color, m.type) }}
                          >
                            <MethodIcon method={m} className="h-5 w-5 text-white" />
                          </span>
                          <div>
                            <p className="font-medium text-ink">{m.name}</p>
                            <p className="text-xs text-ink-muted">{m.slug}</p>
                          </div>
                          {m.badge && (
                            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-ink-soft">
                              {m.badge}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{TYPE_LABELS[m.type]}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            m.is_active
                              ? 'bg-accent-soft text-accent'
                              : 'bg-surface-2 text-ink-muted'
                          }`}
                        >
                          {m.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-ink-soft">
                          <Eye className="h-4 w-4" /> {m.views_count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-ink-soft">
                          <Copy className="h-4 w-4" /> {m.copies_count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => toggleMutation.mutate(m.id)}
                            disabled={toggleMutation.isPending}
                            title={m.is_active ? 'Désactiver' : 'Activer'}
                            className="rounded-lg p-2 text-ink-muted transition hover:bg-surface-2 hover:text-ink"
                          >
                            <Power className={`h-4 w-4 ${m.is_active ? 'text-accent' : ''}`} />
                          </button>
                          <Link
                            to={`/admin/payment-methods/${m.id}/edit`}
                            title="Modifier"
                            className="rounded-lg p-2 text-ink-muted transition hover:bg-surface-2 hover:text-ink"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setToDelete(m)}
                            title="Supprimer"
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {search !== '' && (
        <p className="text-xs text-ink-muted">
          Le réordonnancement est désactivé pendant une recherche.
        </p>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Supprimer la méthode"
        message={`Voulez-vous vraiment supprimer « ${toDelete?.name} » ? Cette action est irréversible et supprimera aussi ses champs et statistiques.`}
        confirmLabel="Supprimer"
        loading={deleteMutation.isPending}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
