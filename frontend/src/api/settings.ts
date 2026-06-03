import { apiClient } from './client'
import type { AppSettings, SettingsInput } from '@/types/settings'

export const settingsApi = {
  /** Public read of theme settings. */
  async getPublic(): Promise<AppSettings> {
    const { data } = await apiClient.get<AppSettings>('/settings')
    return data
  },

  /** Admin read. */
  async getAdmin(): Promise<AppSettings> {
    const { data } = await apiClient.get<AppSettings>('/admin/settings')
    return data
  },

  async update(payload: Partial<SettingsInput>): Promise<AppSettings> {
    const { data } = await apiClient.put<AppSettings>('/admin/settings', payload)
    return data
  },
}
