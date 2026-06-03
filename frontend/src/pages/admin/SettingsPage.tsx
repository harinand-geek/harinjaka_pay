import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageOff, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { settingsApi } from '@/api/settings'
import { extractErrorMessage } from '@/api/client'

const FOOTER_KEYS = [
  'footer_phone',
  'footer_whatsapp',
  'footer_email',
  'footer_facebook',
  'footer_twitter',
  'footer_linkedin',
  'footer_shop',
  'footer_blog',
  'footer_qrcode',
  'footer_address',
  'footer_hours',
] as const

type FooterKey = (typeof FOOTER_KEYS)[number]
type FooterState = Record<FooterKey, string>

const emptyFooter = (): FooterState =>
  Object.fromEntries(FOOTER_KEYS.map((k) => [k, ''])) as FooterState

interface FieldMeta {
  key: FooterKey
  label: string
  type?: string
  placeholder?: string
}

const CONTACT_FIELDS: FieldMeta[] = [
  { key: 'footer_phone', label: 'Téléphone', placeholder: '+261 38 17 181 89' },
  { key: 'footer_whatsapp', label: 'Numéro WhatsApp', placeholder: '261376474270' },
  { key: 'footer_email', label: 'E-mail', type: 'email', placeholder: 'contact@harinjaka.mg' },
]

const LINK_FIELDS: FieldMeta[] = [
  { key: 'footer_facebook', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/…' },
  { key: 'footer_twitter', label: 'Twitter / X', type: 'url', placeholder: 'https://x.com/…' },
  { key: 'footer_linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/in/…' },
  { key: 'footer_shop', label: 'Shop', type: 'url', placeholder: 'https://shop.harinjaka.mg' },
  { key: 'footer_blog', label: 'Blog', type: 'url', placeholder: 'https://blog.harinjaka.mg' },
  { key: 'footer_qrcode', label: 'QrCode', type: 'url', placeholder: 'https://qrcode.harinjaka.mg' },
]

const INFO_FIELDS: FieldMeta[] = [
  { key: 'footer_address', label: 'Adresse', placeholder: 'Ambohijanahary, Antananarivo, Madagascar' },
  { key: 'footer_hours', label: 'Horaires', placeholder: 'Lun–Ven : 8h–20h' },
]

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [imageUrl, setImageUrl] = useState('')
  const [overlay, setOverlay] = useState('0.6')
  const [footer, setFooter] = useState<FooterState>(emptyFooter)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: settingsApi.getAdmin,
  })

  useEffect(() => {
    if (data) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setImageUrl(data.background_image_url ?? '')
      setOverlay(data.background_overlay ?? '0.6')
      setFooter(
        Object.fromEntries(FOOTER_KEYS.map((k) => [k, data[k] ?? ''])) as FooterState,
      )
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: () => {
      const footerPayload = Object.fromEntries(
        FOOTER_KEYS.map((k) => [k, footer[k].trim()]),
      )
      return settingsApi.update({
        background_image_url: imageUrl.trim(),
        background_overlay: overlay,
        ...footerPayload,
      })
    },
    onSuccess: () => {
      toast.success('Paramètres enregistrés')
      // Refresh the public background + footer immediately.
      void queryClient.invalidateQueries({ queryKey: ['public-settings'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    saveMutation.mutate()
  }

  const updateFooter = (key: FooterKey, value: string) =>
    setFooter((prev) => ({ ...prev, [key]: value }))

  const overlayNum = Math.min(Math.max(Number.parseFloat(overlay) || 0, 0), 1)

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 text-ink-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const renderFields = (fields: FieldMeta[]) =>
    fields.map((f) => (
      <div key={f.key}>
        <label htmlFor={f.key} className="mb-1.5 block text-sm font-medium text-ink-soft">
          {f.label}
        </label>
        <input
          id={f.key}
          type={f.type ?? 'text'}
          value={footer[f.key]}
          onChange={(e) => updateFooter(f.key, e.target.value)}
          placeholder={f.placeholder}
          className="field-input"
        />
      </div>
    ))

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Paramètres</h2>
        <p className="text-sm text-ink-muted">
          Personnalisez l'apparence du site et les informations du pied de page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Background */}
        <div className="admin-card space-y-6 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-ink">Image de fond</h3>

          <div>
            <label htmlFor="bg-url" className="mb-1.5 block text-sm font-medium text-ink-soft">
              URL de l'image de fond
            </label>
            <input
              id="bg-url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemple.com/mon-image.jpg"
              className="field-input"
            />
            <p className="mt-1.5 text-xs text-ink-muted">
              Laissez vide pour revenir au fond clair par défaut.
            </p>
          </div>

          <div>
            <label htmlFor="overlay" className="mb-1.5 block text-sm font-medium text-ink-soft">
              Intensité du voile : <span className="font-mono">{overlayNum.toFixed(2)}</span>
            </label>
            <input
              id="overlay"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={overlayNum}
              onChange={(e) => setOverlay(e.target.value)}
              className="w-full accent-[#047857]"
            />
            <p className="mt-1.5 text-xs text-ink-muted">
              Plus la valeur est élevée, plus l'image est voilée (le texte reste toujours lisible).
            </p>
          </div>

          {/* Live preview — mirrors the veil applied on the public page */}
          <div>
            <p className="mb-2 text-sm font-medium text-ink-soft">Aperçu</p>
            <div className="relative h-44 w-full overflow-hidden rounded-xl ring-1 ring-line">
              {imageUrl.trim() ? (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${imageUrl.trim()}")` }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: `rgba(246,246,244,${Math.max(overlayNum, 0.8)})` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-ink">Paiement</span>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-2 text-ink-muted">
                  <ImageOff className="h-7 w-7" />
                  <span className="text-xs">Aucune image — fond clair par défaut</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="admin-card space-y-6 rounded-xl p-6">
          <div>
            <h3 className="text-sm font-semibold text-ink">Pied de page</h3>
            <p className="text-xs text-ink-muted">
              Laissez un champ vide pour utiliser la valeur par défaut (affichée en gris).
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Contact</p>
            <div className="grid gap-4 md:grid-cols-2">{renderFields(CONTACT_FIELDS)}</div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Liens</p>
            <div className="grid gap-4 md:grid-cols-2">{renderFields(LINK_FIELDS)}</div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Informations</p>
            <div className="grid gap-4 md:grid-cols-2">{renderFields(INFO_FIELDS)}</div>
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
