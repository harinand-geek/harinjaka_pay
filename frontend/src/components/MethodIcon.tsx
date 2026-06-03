import { createElement, useState } from 'react'
import type { PaymentMethod } from '@/types/payment'
import { effectiveLogo, resolveIcon } from '@/lib/paymentVisuals'

interface MethodIconProps {
  method: Pick<PaymentMethod, 'icon' | 'type' | 'logo_url' | 'name'> & { slug?: string | null; color?: string | null }
  className?: string
  /** Tailwind sizing applied to the rendered logo image. */
  imgClassName?: string
}

/**
 * Renders, in order of priority: an admin-uploaded logo, then a local
 * /public logo (by slug), then the resolved Lucide icon. If a logo fails to
 * load it gracefully falls back to the icon — tinted with the brand color so
 * it stays visible on the light logo tile.
 */
export default function MethodIcon({ method, className, imgClassName }: MethodIconProps) {
  const [failed, setFailed] = useState(false)
  const logo = effectiveLogo(method)

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt={method.name}
        className={imgClassName ?? 'h-full w-full object-contain'}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    )
  }

  // A logo was expected but unavailable → light tile, so tint the icon.
  if (logo) {
    return createElement(resolveIcon(method), {
      className,
      style: { color: method.color ?? '#047857' },
    })
  }

  return createElement(resolveIcon(method), { className })
}
