import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Inbox, Loader2, WifiOff } from 'lucide-react'
import { paymentMethodsApi } from '@/api/paymentMethods'
import { analyticsApi } from '@/api/analytics'
import type { PaymentMethod } from '@/types/payment'
import PublicLayout from '@/components/PublicLayout'
import PaymentCard from '@/components/PaymentCard'
import PaymentDetails from '@/components/PaymentDetails'
import ThemeToggle from '@/components/ThemeToggle'

export default function PaymentPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const detailsRef = useRef<HTMLDivElement>(null)

  const { data: methods, isLoading, isError } = useQuery({
    queryKey: ['public-payment-methods'],
    queryFn: paymentMethodsApi.listPublic,
  })

  useEffect(() => {
    void analyticsApi.trackVisit()
  }, [])

  // Bring the details into view on selection — essential on mobile where the
  // cards are stacked and the details would otherwise render far below.
  useEffect(() => {
    if (selectedId == null) return
    const el = detailsRef.current
    if (!el) return
    requestAnimationFrame(() =>
      el.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }, [selectedId])

  const handleSelect = (method: PaymentMethod) => {
    setSelectedId(method.id)
    void analyticsApi.trackEvent(method.id, 'view_method')
  }

  const selected = methods?.find((m) => m.id === selectedId) ?? null

  return (
    <PublicLayout>
      {/* Header */}
      <header className="px-6 pt-10 md:pt-14">
        <div className="relative mx-auto max-w-6xl">
          <ThemeToggle className="absolute right-0 top-0" />

          <div className="flex items-center justify-center gap-2.5 text-sm font-medium text-ink-muted">
            <img src="/digitalsub_icon.png" alt="" className="h-5 w-5 rounded" />
            Digital Subscription Madagascar
          </div>

          <h1 className="mt-6 text-center text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            Moyens de paiement
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-base text-ink-soft md:text-lg">
            Sélectionnez un moyen de paiement et copiez les informations en un clic.
          </p>
          <div className="mt-8 border-b border-line" />
        </div>
      </header>

      <div className="mx-auto max-w-6xl flex-1 px-6 pt-8">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-24 text-ink-muted">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Chargement des moyens de paiement…</p>
          </div>
        )}

        {isError && (
          <div className="admin-card mx-auto max-w-md rounded-xl p-10 text-center">
            <WifiOff className="mx-auto mb-4 h-10 w-10 text-ink-muted" />
            <h2 className="mb-1.5 text-lg font-semibold text-ink">Connexion impossible</h2>
            <p className="text-sm text-ink-soft">
              Impossible de charger les moyens de paiement. Réessayez plus tard.
            </p>
          </div>
        )}

        {!isLoading && !isError && methods && methods.length === 0 && (
          <div className="admin-card mx-auto max-w-md rounded-xl p-10 text-center">
            <Inbox className="mx-auto mb-4 h-10 w-10 text-ink-muted" />
            <h2 className="mb-1.5 text-lg font-semibold text-ink">Aucun moyen disponible</h2>
            <p className="text-sm text-ink-soft">
              Aucun moyen de paiement n'est actif pour le moment.
            </p>
          </div>
        )}

        {!isLoading && !isError && methods && methods.length > 0 && (
          <>
            <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {methods.map((method) => (
                <PaymentCard
                  key={method.id}
                  method={method}
                  selected={selectedId === method.id}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            <div ref={detailsRef} className="scroll-mt-6">
              <AnimatePresence mode="wait">
                {selected && <PaymentDetails key={selected.id} method={selected} />}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  )
}
