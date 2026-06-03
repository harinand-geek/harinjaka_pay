import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ImageUp,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { paymentMethodsApi } from '@/api/paymentMethods'
import { extractErrorMessage } from '@/api/client'
import MethodIcon from '@/components/MethodIcon'
import { hasLogo, methodGradient } from '@/lib/paymentVisuals'
import type { PaymentFieldInput, PaymentMethodInput, PaymentMethodType } from '@/types/payment'

const TYPE_OPTIONS: { value: PaymentMethodType; label: string }[] = [
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
  { value: 'other', label: 'Autre' },
]

const BADGE_PRESETS = ['NOUVEAU', 'POPULAIRE', 'FIABLE', 'PRINCIPAL']
const ICON_OPTIONS = ['mobile-alt', 'university', 'card', 'wallet', 'banknote', 'building']

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const emptyForm: PaymentMethodInput = {
  name: '',
  slug: '',
  type: 'mobile_money',
  description: '',
  badge: '',
  icon: 'mobile-alt',
  color: '#047857',
  is_active: true,
  sort_order: 0,
  fields: [],
}

export default function PaymentMethodFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<PaymentMethodInput>(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin-payment-method', id],
    queryFn: () => paymentMethodsApi.get(Number(id)),
    enabled: isEdit,
  })

  // Seed the editable form once the existing method has been fetched.
  // (Syncing fetched server data into local editable state is a valid effect.)
  useEffect(() => {
    if (existing) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setSlugTouched(true)
      setForm({
        name: existing.name,
        slug: existing.slug,
        type: existing.type,
        description: existing.description ?? '',
        badge: existing.badge ?? '',
        icon: existing.icon ?? 'mobile-alt',
        color: existing.color ?? '#047857',
        is_active: existing.is_active,
        sort_order: existing.sort_order,
        fields: existing.fields.map((f) => ({
          id: f.id,
          label: f.label,
          value: f.value,
          copy_value: f.copy_value ?? '',
          sort_order: f.sort_order,
        })),
      })
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [existing])

  const saveMutation = useMutation({
    mutationFn: (payload: PaymentMethodInput) =>
      isEdit ? paymentMethodsApi.update(Number(id), payload) : paymentMethodsApi.create(payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Méthode mise à jour' : 'Méthode créée')
      void queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] })
      navigate('/admin/payment-methods')
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  /* ----- logo upload (edit mode only) ----- */
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogoUrl(existing.logo_url)
    }
  }, [existing])

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => paymentMethodsApi.uploadLogo(Number(id), file),
    onSuccess: (m) => {
      setLogoUrl(m.logo_url)
      toast.success('Logo mis à jour')
      void queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] })
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  const deleteLogoMutation = useMutation({
    mutationFn: () => paymentMethodsApi.deleteLogo(Number(id)),
    onSuccess: (m) => {
      setLogoUrl(m.logo_url)
      toast.success('Logo supprimé')
      void queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] })
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  const onLogoSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadLogoMutation.mutate(file)
    e.target.value = '' // allow re-selecting the same file
  }

  const update = <K extends keyof PaymentMethodInput>(key: K, value: PaymentMethodInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const onNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }))
  }

  /* ----- dynamic fields ----- */
  const updateField = (index: number, patch: Partial<PaymentFieldInput>) =>
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    }))

  const addField = () =>
    setForm((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        { label: '', value: '', copy_value: '', sort_order: prev.fields.length },
      ],
    }))

  const removeField = (index: number) =>
    setForm((prev) => ({
      ...prev,
      fields: prev.fields
        .filter((_, i) => i !== index)
        .map((f, i) => ({ ...f, sort_order: i })),
    }))

  const moveField = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= form.fields.length) return
    setForm((prev) => {
      const fields = [...prev.fields]
      ;[fields[index], fields[target]] = [fields[target], fields[index]]
      return { ...prev, fields: fields.map((f, i) => ({ ...f, sort_order: i })) }
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (form.fields.length === 0) {
      toast.error('Ajoutez au moins un champ copiable.')
      return
    }
    // Normalize: empty copy_value falls back to value on the backend.
    const payload: PaymentMethodInput = {
      ...form,
      fields: form.fields.map((f, i) => ({
        ...f,
        copy_value: f.copy_value.trim() || f.value,
        sort_order: i,
      })),
    }
    saveMutation.mutate(payload)
  }

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-24 text-ink-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const inputClass = 'field-input'

  const hasPreviewLogo = hasLogo({ logo_url: logoUrl, slug: form.slug })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/payment-methods"
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-2 hover:text-ink"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold text-ink">
          {isEdit ? 'Modifier la méthode' : 'Nouvelle méthode'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General */}
        <div className="admin-card space-y-4 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-ink">Informations générales</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-ink-soft">Nom *</label>
              <input
                required
                value={form.name}
                onChange={(e) => onNameChange(e.target.value)}
                className={inputClass}
                placeholder="MVola"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-ink-soft">Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  update('slug', slugify(e.target.value))
                }}
                className={inputClass}
                placeholder="mvola"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-ink-soft">Type *</label>
              <select
                aria-label="Type de méthode"
                value={form.type}
                onChange={(e) => update('type', e.target.value as PaymentMethodType)}
                className={inputClass}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-white">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-ink-soft">Badge</label>
              <input
                list="badge-presets"
                value={form.badge}
                onChange={(e) => update('badge', e.target.value)}
                className={inputClass}
                placeholder="POPULAIRE"
              />
              <datalist id="badge-presets">
                {BADGE_PRESETS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-ink-soft">Description</label>
            <input
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className={inputClass}
              placeholder="Mobile Money Yas"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm text-ink-soft">Icône</label>
              <select
                aria-label="Icône"
                value={form.icon}
                onChange={(e) => update('icon', e.target.value)}
                className={inputClass}
              >
                {ICON_OPTIONS.map((o) => (
                  <option key={o} value={o} className="bg-white">
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-ink-soft">Couleur</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Sélecteur de couleur"
                  value={form.color}
                  onChange={(e) => update('color', e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-surface"
                />
                <input
                  aria-label="Couleur (code hexadécimal)"
                  value={form.color}
                  onChange={(e) => update('color', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => update('is_active', e.target.checked)}
                  className="h-5 w-5 rounded accent-[#047857]"
                />
                Méthode active
              </label>
            </div>
          </div>
        </div>

        {/* Logo upload */}
        <div className="admin-card space-y-4 rounded-2xl p-6">
          <div>
            <h3 className="text-sm font-semibold text-ink">Logo du wallet</h3>
            <p className="text-xs text-ink-muted">
              Téléversez un logo (PNG, JPG, WEBP — max 1 Mo) pour remplacer l'icône par défaut.
            </p>
          </div>

          {!isEdit ? (
            <p className="rounded-lg border border-dashed border-line-strong py-6 text-center text-sm text-ink-muted">
              Enregistrez d'abord la méthode pour pouvoir ajouter un logo.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-5">
              <div
                className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl p-3 ${
                  hasPreviewLogo ? 'bg-white ring-1 ring-line' : 'ring-1 ring-line'
                }`}
                style={hasPreviewLogo ? undefined : { background: methodGradient(form.color, form.type) }}
              >
                <MethodIcon
                  method={{
                    icon: form.icon,
                    type: form.type,
                    logo_url: logoUrl,
                    slug: form.slug,
                    color: form.color,
                    name: form.name,
                  }}
                  className="h-9 w-9 text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={onLogoSelected}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLogoMutation.isPending}
                  className="flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm text-ink-soft transition hover:bg-surface-2 hover:text-ink disabled:opacity-50"
                >
                  {uploadLogoMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageUp className="h-4 w-4" />
                  )}
                  {logoUrl ? 'Changer le logo' : 'Téléverser un logo'}
                </button>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => deleteLogoMutation.mutate()}
                    disabled={deleteLogoMutation.isPending}
                    className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deleteLogoMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic fields */}
        <div className="admin-card space-y-4 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">Champs copiables</h3>
              <p className="text-xs text-ink-muted">
                Numéro, nom, IBAN… Chaque champ aura un bouton copier sur la page publique.
              </p>
            </div>
            <button
              type="button"
              onClick={addField}
              className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-ink-soft transition hover:bg-surface-2 hover:text-ink"
            >
              <Plus className="h-4 w-4" /> Ajouter un champ
            </button>
          </div>

          {form.fields.length === 0 && (
            <p className="rounded-lg border border-dashed border-line-strong py-8 text-center text-sm text-ink-muted">
              Aucun champ. Cliquez sur « Ajouter un champ ».
            </p>
          )}

          <div className="space-y-3">
            {form.fields.map((field, index) => (
              <div key={index} className="rounded-lg border border-line bg-surface-2 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-muted">Champ #{index + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveField(index, -1)}
                      disabled={index === 0}
                      className="rounded p-1 text-ink-muted hover:bg-surface-2 hover:text-ink disabled:opacity-30"
                      aria-label="Monter le champ"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveField(index, 1)}
                      disabled={index === form.fields.length - 1}
                      className="rounded p-1 text-ink-muted hover:bg-surface-2 hover:text-ink disabled:opacity-30"
                      aria-label="Descendre le champ"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="rounded p-1 text-red-300 hover:bg-red-500/15"
                      aria-label="Supprimer le champ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    required
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    className={inputClass}
                    placeholder="Libellé (ex: Numéro MVola)"
                  />
                  <input
                    required
                    value={field.value}
                    onChange={(e) => updateField(index, { value: e.target.value })}
                    className={inputClass}
                    placeholder="Valeur affichée (+261 38…)"
                  />
                  <input
                    value={field.copy_value}
                    onChange={(e) => updateField(index, { copy_value: e.target.value })}
                    className={inputClass}
                    placeholder="Valeur copiée (optionnel)"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            to="/admin/payment-methods"
            className="rounded-lg border border-line px-5 py-2.5 text-sm text-ink-soft transition hover:bg-surface-2 hover:text-ink"
          >
            Annuler
          </Link>
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
            {isEdit ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  )
}
