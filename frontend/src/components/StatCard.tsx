import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  accent?: string
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = '#047857',
}: StatCardProps) {
  return (
    <div className="admin-card rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">{label}</p>
          <p className="mt-1 truncate text-2xl font-bold text-ink">{value}</p>
          {hint && <p className="mt-1 truncate text-xs text-ink-muted">{hint}</p>}
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1a` }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
      </div>
    </div>
  )
}
