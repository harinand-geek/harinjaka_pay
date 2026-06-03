export interface TopMethod {
  id: number
  name: string
  count: number
}

export interface RecentVisit {
  id: number
  device_type: string | null
  browser: string | null
  platform: string | null
  country: string | null
  city: string | null
  referrer: string | null
  visited_at: string | null
}

export interface DailyPoint {
  date: string
  total: number
}

export interface AnalyticsOverview {
  total_methods: number
  active_methods: number
  total_visits: number
  unique_visitors: number
  total_copies: number
  most_viewed_method: TopMethod | null
  most_copied_method: TopMethod | null
  recent_visits: RecentVisit[]
  visits_per_day: DailyPoint[]
}

export interface BreakdownItem {
  label: string
  total: number
}

export interface MethodStat {
  id: number
  name: string
  views: number
  copies: number
}

export interface LocationBreakdown {
  countries: BreakdownItem[]
  regions: BreakdownItem[]
  cities: BreakdownItem[]
}

export type PaymentEventType = 'view_method' | 'copy_field' | 'copy_all'
