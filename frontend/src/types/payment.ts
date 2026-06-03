export type PaymentMethodType = 'mobile_money' | 'bank_transfer' | 'other'

export interface PaymentField {
  id: number
  label: string
  value: string
  copy_value: string
  sort_order: number
}

export interface PaymentMethod {
  id: number
  name: string
  slug: string
  type: PaymentMethodType
  description: string | null
  badge: string | null
  icon: string | null
  logo_url: string | null
  color: string | null
  is_active: boolean
  sort_order: number
  fields: PaymentField[]
  created_at?: string
  updated_at?: string
}

/** Admin list rows carry analytics counters. */
export interface PaymentMethodWithStats extends PaymentMethod {
  views_count: number
  copies_count: number
}

/** Editable field shape used by the admin form (id optional for new rows). */
export interface PaymentFieldInput {
  id?: number
  label: string
  value: string
  copy_value: string
  sort_order: number
}

export interface PaymentMethodInput {
  name: string
  slug: string
  type: PaymentMethodType
  description: string
  badge: string
  icon: string
  color: string
  is_active: boolean
  sort_order: number
  fields: PaymentFieldInput[]
}
