import { apiClient } from './client'
import type {
  AnalyticsOverview,
  BreakdownItem,
  DailyPoint,
  LocationBreakdown,
  MethodStat,
  PaymentEventType,
  RecentVisit,
} from '@/types/analytics'

const SESSION_KEY = 'harinjaka_session_id'

/** Stable per-browser session id used to group events (not personally identifying). */
export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export const analyticsApi = {
  /** Fire-and-forget visit tracking. Never throws. */
  async trackVisit(): Promise<void> {
    try {
      await apiClient.post('/analytics/visit', {
        session_id: getSessionId(),
        referrer: document.referrer || null,
      })
    } catch {
      /* analytics must never break the UX */
    }
  },

  /** Fire-and-forget payment interaction tracking. Never throws. */
  async trackEvent(
    paymentMethodId: number,
    eventType: PaymentEventType,
    fieldLabel?: string,
  ): Promise<void> {
    try {
      await apiClient.post('/analytics/payment-event', {
        payment_method_id: paymentMethodId,
        event_type: eventType,
        field_label: fieldLabel ?? null,
        session_id: getSessionId(),
      })
    } catch {
      /* ignore */
    }
  },

  /* ---- Admin reads ---- */
  async overview(): Promise<AnalyticsOverview> {
    const { data } = await apiClient.get<AnalyticsOverview>('/admin/analytics/overview')
    return data
  },

  async visits(): Promise<{ visits_per_day: DailyPoint[]; recent_visits: RecentVisit[] }> {
    const { data } = await apiClient.get('/admin/analytics/visits')
    return data
  },

  async methodStats(): Promise<{ methods: MethodStat[] }> {
    const { data } = await apiClient.get('/admin/analytics/payment-methods')
    return data
  },

  async locations(): Promise<LocationBreakdown> {
    const { data } = await apiClient.get<LocationBreakdown>('/admin/analytics/locations')
    return data
  },

  async devices(): Promise<{ devices: BreakdownItem[]; browsers: BreakdownItem[] }> {
    const { data } = await apiClient.get('/admin/analytics/devices')
    return data
  },

  async referrers(): Promise<{ referrers: BreakdownItem[] }> {
    const { data } = await apiClient.get('/admin/analytics/referrers')
    return data
  },
}
