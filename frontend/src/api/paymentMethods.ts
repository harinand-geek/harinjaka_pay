import { apiClient } from './client'
import type {
  PaymentMethod,
  PaymentMethodInput,
  PaymentMethodWithStats,
} from '@/types/payment'

export const paymentMethodsApi = {
  /** Public: active methods only. */
  async listPublic(): Promise<PaymentMethod[]> {
    const { data } = await apiClient.get<{ data: PaymentMethod[] }>('/payment-methods')
    return data.data
  },

  /** Admin: all methods with view/copy counters. */
  async listAdmin(): Promise<PaymentMethodWithStats[]> {
    const { data } = await apiClient.get<{ data: PaymentMethodWithStats[] }>(
      '/admin/payment-methods',
    )
    return data.data
  },

  async get(id: number): Promise<PaymentMethod> {
    const { data } = await apiClient.get<{ data: PaymentMethod }>(
      `/admin/payment-methods/${id}`,
    )
    return data.data
  },

  async create(payload: PaymentMethodInput): Promise<PaymentMethod> {
    const { data } = await apiClient.post<{ data: PaymentMethod }>(
      '/admin/payment-methods',
      payload,
    )
    return data.data
  },

  async update(id: number, payload: PaymentMethodInput): Promise<PaymentMethod> {
    const { data } = await apiClient.put<{ data: PaymentMethod }>(
      `/admin/payment-methods/${id}`,
      payload,
    )
    return data.data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/payment-methods/${id}`)
  },

  async toggle(id: number): Promise<PaymentMethod> {
    const { data } = await apiClient.patch<{ data: PaymentMethod }>(
      `/admin/payment-methods/${id}/toggle`,
    )
    return data.data
  },

  async reorder(order: number[]): Promise<void> {
    await apiClient.patch('/admin/payment-methods/reorder', { order })
  },

  async uploadLogo(id: number, file: File): Promise<PaymentMethod> {
    const formData = new FormData()
    formData.append('logo', file)
    const { data } = await apiClient.post<{ data: PaymentMethod }>(
      `/admin/payment-methods/${id}/logo`,
      formData,
      // Let the browser set the multipart boundary itself.
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data.data
  },

  async deleteLogo(id: number): Promise<PaymentMethod> {
    const { data } = await apiClient.delete<{ data: PaymentMethod }>(
      `/admin/payment-methods/${id}/logo`,
    )
    return data.data
  },
}
