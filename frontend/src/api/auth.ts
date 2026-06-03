import { apiClient } from './client'
import type {
  AdminUser,
  LoginCredentials,
  LoginResponse,
  ProfileUpdateInput,
} from '@/types/auth'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/admin/login', credentials)
    return data
  },

  async logout(): Promise<void> {
    await apiClient.post('/admin/logout')
  },

  async me(): Promise<AdminUser> {
    const { data } = await apiClient.get<AdminUser>('/admin/me')
    return data
  },

  async updateProfile(payload: ProfileUpdateInput): Promise<AdminUser> {
    const { data } = await apiClient.put<AdminUser>('/admin/profile', payload)
    return data
  },
}
