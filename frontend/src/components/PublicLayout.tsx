import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Newspaper,
  Phone,
  QrCode,
  Share2,
  ShoppingCart,
  ExternalLink,
} from 'lucide-react'
import { settingsApi } from '@/api/settings'

/** Fallback footer values — used when the admin hasn't set a custom value. */
const DEFAULTS = {
  phone: '+261 38 17 181 89',
  whatsapp: '261376474270',
  email: 'contact@harinjaka.mg',
  facebook: 'https://web.facebook.com/harinjaka.andriananja',
  twitter: 'https://x.com/HarinjakaANDRI1',
  linkedin: 'https://www.linkedin.com/in/harinjaka-andriananja',
  shop: 'https://shop.harinjaka.mg',
  blog: 'https://blog.harinjaka.mg',
  qrcode: 'https://qrcode.harinjaka.mg',
  address: 'Ambohijanahary, Antananarivo, Madagascar',
  hours: 'Lun–Ven : 8h–20h',
}

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`
const waHref = (number: string) => `https://wa.me/${number.replace(/\D/g, '')}`

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { data } = useQuery({
    queryKey: ['public-settings'],
    queryFn: settingsApi.getPublic,
    staleTime: 5 * 60_000,
  })

  // Each field falls back to its default when empty/unset.
  const v = (value: string | null | undefined, fallback: string) =>
    value && value.trim() !== '' ? value.trim() : fallback

  const phone = v(data?.footer_phone, DEFAULTS.phone)
  const whatsapp = v(data?.footer_whatsapp, DEFAULTS.whatsapp)
  const email = v(data?.footer_email, DEFAULTS.email)

  const contacts = [
    { icon: Phone, label: phone, href: telHref(phone) },
    { icon: MessageCircle, label: 'WhatsApp', href: waHref(whatsapp) },
    { icon: Mail, label: email, href: `mailto:${email}` },
  ]

  const socials = [
    { label: 'Facebook', href: v(data?.footer_facebook, DEFAULTS.facebook) },
    { label: 'Twitter / X', href: v(data?.footer_twitter, DEFAULTS.twitter) },
    { label: 'LinkedIn', href: v(data?.footer_linkedin, DEFAULTS.linkedin) },
  ]

  const services = [
    { icon: ShoppingCart, label: 'Shop', href: v(data?.footer_shop, DEFAULTS.shop) },
    { icon: Newspaper, label: 'Blog', href: v(data?.footer_blog, DEFAULTS.blog) },
    { icon: QrCode, label: 'QrCode', href: v(data?.footer_qrcode, DEFAULTS.qrcode) },
  ]

  const address = v(data?.footer_address, DEFAULTS.address)
  const hours = v(data?.footer_hours, DEFAULTS.hours)

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>

      <footer className="footer-line mt-20 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-3">
            {/* Contact */}
            <div>
              <h3 className="mb-5 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wide text-ink-soft">
                <Phone className="h-4 w-4 text-ink-muted" />
                Contact
              </h3>
              <div className="space-y-3">
                {contacts.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    className="flex items-center gap-3 text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    <c.icon className="h-4 w-4 text-ink-muted" />
                    <span>{c.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div>
              <h3 className="mb-5 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wide text-ink-soft">
                <Share2 className="h-4 w-4 text-ink-muted" />
                Réseaux sociaux
              </h3>
              <div className="space-y-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    <ExternalLink className="h-4 w-4 text-ink-muted" />
                    <span>{s.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="mb-5 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wide text-ink-soft">
                <ShoppingCart className="h-4 w-4 text-ink-muted" />
                Services
              </h3>
              <div className="space-y-3">
                {services.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="flex items-center gap-3 text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    <s.icon className="h-4 w-4 text-ink-muted" />
                    <span>{s.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-line pt-8 text-center text-sm text-ink-muted">
            <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-ink-muted" />
                <span>{address}</span>
              </div>
              <div className="hidden h-1 w-1 rounded-full bg-line-strong md:block" />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-ink-muted" />
                <span>{hours}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
