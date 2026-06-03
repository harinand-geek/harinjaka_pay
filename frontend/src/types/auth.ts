export interface AdminUser {
  id: number
  name: string
  email: string
  is_admin?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AdminUser
}

export interface ProfileUpdateInput {
  name?: string
  email: string
  current_password: string
  password?: string
  password_confirmation?: string
}
