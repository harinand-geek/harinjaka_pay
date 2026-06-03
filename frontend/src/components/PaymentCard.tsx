import { Check } from 'lucide-react'
import type { PaymentMethod } from '@/types/payment'
import { hasLogo, methodGradient } from '@/lib/paymentVisuals'
import MethodIcon from './MethodIcon'

interface PaymentCardProps {
  method: PaymentMethod
  selected: boolean
  onSelect: (method: PaymentMethod) => void
}

export default function PaymentCard({ method, selected, onSelect }: PaymentCardProps) {
  const logo = hasLogo(method)

  return (
    <button
      type="button"
      onClick={() => onSelect(method)}
      aria-pressed={selected ? 'true' : 'false'}
      className={`payment-card glass-card relative flex h-full w-full flex-col items-center rounded-xl p-6 text-center ${
        selected ? 'selected' : ''
      }`}
    >
      {/* Selected check */}
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}

      {/* Icon / logo tile */}
      <div
        className={`mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl ${
          logo ? 'bg-white ring-1 ring-line' : 'p-2.5'
        }`}
        style={logo ? undefined : { background: methodGradient(method.color, method.type) }}
      >
        <MethodIcon
          method={method}
          className="h-7 w-7 text-white"
          imgClassName="h-full w-full rounded-lg object-cover"
        />
      </div>

      <h3 className="text-base font-semibold text-ink">{method.name}</h3>

      {method.description && (
        <p className="mt-1 text-sm text-ink-soft">{method.description}</p>
      )}

      {method.badge && (
        <span className="mt-3 inline-flex items-center rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          {method.badge}
        </span>
      )}
    </button>
  )
}
