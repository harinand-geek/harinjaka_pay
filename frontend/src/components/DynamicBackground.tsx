import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '@/api/settings'
import { useTheme } from '@/context/ThemeContext'

/**
 * Renders the admin-configured background image behind all content. The app
 * uses a light theme, so the image is washed with a light veil to keep text
 * readable — the veil has a floor (≈0.8) so contrast is guaranteed regardless
 * of the admin's overlay setting. With no image set, the flat light page
 * background (body) shows through.
 */
export default function DynamicBackground() {
  const { theme } = useTheme()
  const { data } = useQuery({
    queryKey: ['public-settings'],
    queryFn: settingsApi.getPublic,
    staleTime: 5 * 60_000,
  })

  const image = data?.background_image_url
  if (!image) return null

  const parsed = Number.parseFloat(data?.background_overlay ?? '0.6')
  const setting = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0.6
  // Veil matches the active theme, with a readability floor so the hero text
  // always keeps contrast over the image.
  const veil = theme === 'dark' ? '12, 11, 10' : '246, 246, 244'
  const veilTop = Math.max(setting, 0.8)
  const veilBottom = Math.min(Math.max(setting + 0.12, 0.92), 1)

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: -1 }}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${image}")` }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(${veil},${veilTop}) 0%, rgba(${veil},${veilBottom}) 100%)`,
        }}
      />
    </div>
  )
}
