import { createContext, useContext, ReactNode, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getVisitorLocation } from '../lib/geo'

interface DayCount {
  date: string
  count: number
}

interface CountryStat {
  country: string
  countryCode: string
  count: number
}

interface AnalyticsContextValue {
  trackPageView: () => void
  trackEvent: (name: string) => void
  fetchStats: () => Promise<{
    totalViews: number
    events: Record<string, number>
    last7Days: DayCount[]
    byCountry: CountryStat[]
  }>
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

function todayKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const trackPageView = useCallback(() => {
    getVisitorLocation().then(({ country, countryCode }) => {
      supabase.from('analytics_events').insert({ event_name: 'page_view', country, country_code: countryCode }).then()
    })
  }, [])

  const trackEvent = useCallback((name: string) => {
    getVisitorLocation().then(({ country, countryCode }) => {
      supabase.from('analytics_events').insert({ event_name: name, country, country_code: countryCode }).then()
    })
  }, [])

  const fetchStats = useCallback(async () => {
    const since = new Date()
    since.setDate(since.getDate() - 6)
    since.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_name, country, country_code, created_at')
      .gte('created_at', since.toISOString())

    if (error || !data) {
      return { totalViews: 0, events: {}, last7Days: [], byCountry: [] }
    }

    const events: Record<string, number> = {}
    const viewsByDay: Record<string, number> = {}
    const countryCounts: Record<string, { count: number; code: string }> = {}

    for (const row of data) {
      events[row.event_name] = (events[row.event_name] || 0) + 1
      if (row.event_name === 'page_view') {
        const key = todayKey(new Date(row.created_at))
        viewsByDay[key] = (viewsByDay[key] || 0) + 1
      }
      const country = row.country || 'Inconnu'
      if (!countryCounts[country]) countryCounts[country] = { count: 0, code: row.country_code || '' }
      countryCounts[country].count += 1
    }

    const last7Days: DayCount[] = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const key = todayKey(d)
      return { date: key, count: viewsByDay[key] || 0 }
    })

    const byCountry: CountryStat[] = Object.entries(countryCounts)
      .map(([country, v]) => ({ country, countryCode: v.code, count: v.count }))
      .sort((a, b) => b.count - a.count)

    return { totalViews: events.page_view || 0, events, last7Days, byCountry }
  }, [])

  return (
    <AnalyticsContext.Provider value={{ trackPageView, trackEvent, fetchStats }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext)
  if (!ctx) throw new Error('useAnalytics doit être utilisé dans AnalyticsProvider')
  return ctx
}