import {
  Banknote,
  Building2,
  CreditCard,
  Landmark,
  Smartphone,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { PaymentMethod, PaymentMethodType } from '@/types/payment'

/**
 * Maps an admin-provided icon keyword (or the method type) to a Lucide icon.
 * Keeps the public page fully data-driven — no payment info is hardcoded.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  'mobile-alt': Smartphone,
  smartphone: Smartphone,
  mobile: Smartphone,
  university: Landmark,
  bank: Landmark,
  landmark: Landmark,
  building: Building2,
  card: CreditCard,
  'credit-card': CreditCard,
  wallet: Wallet,
  banknote: Banknote,
}

export function resolveIcon(method: Pick<PaymentMethod, 'icon' | 'type'>): LucideIcon {
  if (method.icon && ICON_MAP[method.icon]) {
    return ICON_MAP[method.icon]
  }
  return method.type === 'bank_transfer' ? Landmark : Smartphone
}

/**
 * Static logos shipped in `frontend/public/logos/` keyed by slug. Drop a PNG
 * named after the wallet slug to use it as the wallet icon. An admin-uploaded
 * logo (logo_url) always takes priority over these.
 */
export const LOCAL_LOGOS: Record<string, string> = {
  'airtel-money': '/airtel_money.png',
  mvola: '/mvola_logo.png',
  'orange-money': '/orange_logo.png',
  'bred-madagasikara': '/bred_logo.png',
}

type LogoSource = Pick<PaymentMethod, 'logo_url'> & { slug?: string | null }

/** Resolve the logo to display: uploaded logo first, then a local /public one. */
export function effectiveLogo(method: LogoSource): string | null {
  if (method.logo_url) return method.logo_url
  if (method.slug && LOCAL_LOGOS[method.slug]) return LOCAL_LOGOS[method.slug]
  return null
}

export function hasLogo(method: LogoSource): boolean {
  return effectiveLogo(method) !== null
}

/** Fallback gradient when a method has no explicit color. */
export function methodGradient(color: string | null, type: PaymentMethodType): string {
  if (color) {
    return `linear-gradient(135deg, ${color}, ${color}cc)`
  }
  return type === 'bank_transfer'
    ? 'linear-gradient(135deg, #475569, #334155)'
    : 'linear-gradient(135deg, #047857, #065f46)'
}

export const TYPE_LABELS: Record<PaymentMethodType, string> = {
  mobile_money: 'Mobile Money',
  bank_transfer: 'Virement bancaire',
  other: 'Autre',
}
