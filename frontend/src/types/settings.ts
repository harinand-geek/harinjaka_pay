export interface AppSettings {
  background_image_url: string | null
  background_overlay: string | null

  // Footer — contact
  footer_phone: string | null
  footer_whatsapp: string | null
  footer_email: string | null

  // Footer — links
  footer_facebook: string | null
  footer_twitter: string | null
  footer_linkedin: string | null
  footer_shop: string | null
  footer_blog: string | null
  footer_qrcode: string | null

  // Footer — info
  footer_address: string | null
  footer_hours: string | null
}

export interface SettingsInput {
  background_image_url: string
  background_overlay: string

  footer_phone: string
  footer_whatsapp: string
  footer_email: string

  footer_facebook: string
  footer_twitter: string
  footer_linkedin: string
  footer_shop: string
  footer_blog: string
  footer_qrcode: string

  footer_address: string
  footer_hours: string
}
