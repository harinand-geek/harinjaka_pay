import { motion } from 'framer-motion'
import { CopyCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import type { PaymentMethod } from '@/types/payment'
import { hasLogo, methodGradient, TYPE_LABELS } from '@/lib/paymentVisuals'
import { copyToClipboard } from '@/lib/clipboard'
import { analyticsApi } from '@/api/analytics'
import CopyButton from './CopyButton'
import MethodIcon from './MethodIcon'

interface PaymentDetailsProps {
  method: PaymentMethod
}

export default function PaymentDetails({ method }: PaymentDetailsProps) {
  const handleCopyAll = async () => {
    if (method.fields.length === 0) return
    const text = method.fields
      .map((f) => `${f.label}: ${f.copy_value || f.value}`)
      .join('\n')
    const ok = await copyToClipboard(text)
    if (ok) {
      toast.success('Toutes les informations copiées !')
      void analyticsApi.trackEvent(method.id, 'copy_all')
    } else {
      toast.error('Impossible de copier')
    }
  }

  return (
    <motion.section
      key={method.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="details-section mb-8 rounded-xl p-6 md:p-8"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg ${
              hasLogo(method) ? 'bg-white ring-1 ring-line' : 'p-2'
            }`}
            style={hasLogo(method) ? undefined : { background: methodGradient(method.color, method.type) }}
          >
            <MethodIcon
              method={method}
              className="h-6 w-6 text-white"
              imgClassName="h-full w-full rounded-md object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-ink md:text-2xl">{method.name}</h2>
            <p className="text-sm text-ink-muted">{TYPE_LABELS[method.type]}</p>
          </div>
        </div>

        {method.fields.length > 1 && (
          <button
            type="button"
            onClick={handleCopyAll}
            className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium"
          >
            <CopyCheck className="h-4 w-4" />
            Copier tout
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {method.fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-line bg-surface-2 p-4 transition-colors hover:border-line-strong"
          >
            <div className="min-w-0">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {field.label}
              </p>
              <p className="truncate font-mono text-base font-semibold text-ink">{field.value}</p>
            </div>
            <CopyButton
              value={field.copy_value || field.value}
              label={field.label}
              onCopied={() => analyticsApi.trackEvent(method.id, 'copy_field', field.label)}
            />
          </div>
        ))}
      </div>
    </motion.section>
  )
}
