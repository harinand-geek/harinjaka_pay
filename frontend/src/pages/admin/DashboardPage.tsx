import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Copy,
  CreditCard,
  Eye,
  Loader2,
  MousePointerClick,
  ToggleLeft,
  Users,
} from 'lucide-react'
import { analyticsApi } from '@/api/analytics'
import { useTheme } from '@/context/ThemeContext'
import StatCard from '@/components/StatCard'
import ChartCard from '@/components/ChartCard'

const PIE_COLORS = ['#047857', '#0d9488', '#64748b', '#d97706', '#0284c7', '#9333ea', '#dc2626']

function formatDay(date: string) {
  const d = new Date(date)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export default function DashboardPage() {
  const overview = useQuery({ queryKey: ['analytics', 'overview'], queryFn: analyticsApi.overview })
  const methodStats = useQuery({ queryKey: ['analytics', 'methods'], queryFn: analyticsApi.methodStats })
  const devices = useQuery({ queryKey: ['analytics', 'devices'], queryFn: analyticsApi.devices })
  const locations = useQuery({ queryKey: ['analytics', 'locations'], queryFn: analyticsApi.locations })
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const AXIS = dark ? '#8f8983' : '#79716b'
  const GRID = dark ? '#322e2c' : '#e7e5e4'
  const SERIES = dark ? '#34d399' : '#047857'
  const SERIES_ALT = dark ? '#fbbf24' : '#d97706'
  const TOOLTIP_STYLE = {
    background: dark ? '#1a1817' : '#ffffff',
    border: `1px solid ${dark ? '#322e2c' : '#e7e5e4'}`,
    borderRadius: 10,
    color: dark ? '#f5f4f2' : '#1c1917',
    boxShadow: '0 4px 16px -6px rgba(0,0,0,0.25)',
  }

  if (overview.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (overview.isError || !overview.data) {
    return (
      <div className="admin-card rounded-xl p-8 text-center text-red-600">
        Impossible de charger les statistiques.
      </div>
    )
  }

  const o = overview.data
  const methods = methodStats.data?.methods ?? []
  const topViewed = [...methods].sort((a, b) => b.views - a.views).slice(0, 6)
  const topCopied = [...methods].sort((a, b) => b.copies - a.copies).slice(0, 6)

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Méthodes" value={o.total_methods} icon={CreditCard} accent="#047857" />
        <StatCard label="Actives" value={o.active_methods} icon={ToggleLeft} accent="#0d9488" />
        <StatCard label="Visites" value={o.total_visits} icon={Eye} accent="#0284c7" />
        <StatCard label="Visiteurs uniques" value={o.unique_visitors} icon={Users} accent="#64748b" />
        <StatCard label="Copies" value={o.total_copies} icon={Copy} accent="#d97706" />
        <StatCard
          label="Plus consultée"
          value={o.most_viewed_method?.name ?? '—'}
          hint={o.most_viewed_method ? `${o.most_viewed_method.count} vues` : undefined}
          icon={MousePointerClick}
          accent="#9333ea"
        />
      </div>

      {/* Visits over time */}
      <ChartCard title="Visites par jour" subtitle="30 derniers jours">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={o.visits_per_day}>
            <defs>
              <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={SERIES} stopOpacity={0.25} />
                <stop offset="95%" stopColor={SERIES} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis dataKey="date" tickFormatter={formatDay} stroke={AXIS} fontSize={12} />
            <YAxis allowDecimals={false} stroke={AXIS} fontSize={12} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelFormatter={(l) => `Date : ${l}`}
            />
            <Area type="monotone" dataKey="total" name="Visites" stroke={SERIES} fill="url(#visitsGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Method charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Méthodes les plus consultées">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topViewed} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis type="number" allowDecimals={false} stroke={AXIS} fontSize={12} />
              <YAxis type="category" dataKey="name" width={110} stroke={AXIS} fontSize={12} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(28,25,23,0.04)' }} />
              <Bar dataKey="views" name="Vues" fill={SERIES} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Méthodes les plus copiées">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topCopied} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis type="number" allowDecimals={false} stroke={AXIS} fontSize={12} />
              <YAxis type="category" dataKey="name" width={110} stroke={AXIS} fontSize={12} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(28,25,23,0.04)' }} />
              <Bar dataKey="copies" name="Copies" fill={SERIES_ALT} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Device + browser */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Répartition par appareil">
          {devices.data && devices.data.devices.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={devices.data.devices} dataKey="total" nameKey="label" outerRadius={90} label>
                  {devices.data.devices.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="Répartition par navigateur">
          {devices.data && devices.data.browsers.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={devices.data.browsers} dataKey="total" nameKey="label" outerRadius={90} label>
                  {devices.data.browsers.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>
      </div>

      {/* Locations */}
      <div className="grid gap-6 lg:grid-cols-3">
        <LocationList title="Pays" items={locations.data?.countries ?? []} />
        <LocationList title="Régions" items={locations.data?.regions ?? []} />
        <LocationList title="Villes" items={locations.data?.cities ?? []} />
      </div>

      {/* Recent visits */}
      <ChartCard title="Dernières visites">
        {o.recent_visits.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">Aucune visite enregistrée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-ink-muted">
                <tr className="border-b border-line">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Appareil</th>
                  <th className="py-2 pr-4 font-medium">Navigateur</th>
                  <th className="py-2 pr-4 font-medium">Lieu</th>
                  <th className="py-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="text-ink">
                {o.recent_visits.map((v) => (
                  <tr key={v.id} className="border-b border-line">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {v.visited_at ? new Date(v.visited_at).toLocaleString('fr-FR') : '—'}
                    </td>
                    <td className="py-2 pr-4 capitalize">{v.device_type ?? '—'}</td>
                    <td className="py-2 pr-4">{v.browser ?? '—'}</td>
                    <td className="py-2 pr-4">
                      {[v.city, v.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="py-2 max-w-[200px] truncate text-ink-muted">
                      {v.referrer || 'Direct'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  )
}

function LocationList({ title, items }: { title: string; items: { label: string; total: number }[] }) {
  return (
    <ChartCard title={`Par ${title.toLowerCase()}`}>
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-muted">Aucune donnée de localisation.</p>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 8).map((item) => (
            <li key={item.label} className="flex items-center justify-between text-sm">
              <span className="truncate text-ink">{item.label}</span>
              <span className="ml-2 shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                {item.total}
              </span>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-ink-muted">
      Pas encore de données.
    </div>
  )
}
