import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Signup {
  id: string
  fullname: string
  phone: string
  description: string | null
  country: string | null
  gender: 'homme' | 'femme'
  status: string
  created_at: string
}

interface RevenueChartProps {
  signups: Signup[]
}

type Period = 'today' | 'week' | 'month' | 'year'

export default function RevenueChart({ signups }: RevenueChartProps) {
  const [period, setPeriod] = useState<Period>('week')

  const { chartData, currentTotal, previousTotal, daysCount } = useMemo(() => {
    const paidSignups = signups.filter((s) => s.status === 'payé')

    const revenueByDate: Record<string, number> = {}
    paidSignups.forEach((signup) => {
      const date = new Date(signup.created_at)
      const dateStr = date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      const price = signup.gender === 'homme' ? 50000 : 40000
      revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + price
    })

    let daysToShow = 7
    let labelFormat: (date: Date) => string

    if (period === 'today') {
      daysToShow = 1
      labelFormat = (date: Date) =>
        date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    } else if (period === 'week') {
      daysToShow = 7
      labelFormat = (date: Date) => {
        const day = date.getDate()
        const dayOfWeek = date.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3)
        return `${day} ${dayOfWeek}`
      }
    } else if (period === 'month') {
      daysToShow = 30
      labelFormat = (date: Date) => date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    } else {
      // year
      daysToShow = 365
      labelFormat = (date: Date) => date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    }

    const today = new Date()
    const dates: Array<{ date: string; current: number; previous: number }> = []

    // Génère les dates actuelles
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })

      const current = revenueByDate[dateStr] || 0

      // Période précédente (même durée, mais avant)
      const dPrev = new Date(d)
      dPrev.setDate(dPrev.getDate() - daysToShow)
      const dateStrPrev = dPrev.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      const previous = revenueByDate[dateStrPrev] || 0

      dates.push({
        date: labelFormat(d),
        current,
        previous
      })
    }

    const currentTotal = dates.reduce((sum, d) => sum + d.current, 0)
    const previousTotal = dates.reduce((sum, d) => sum + d.previous, 0)

    return { chartData: dates, currentTotal, previousTotal, daysCount: daysToShow }
  }, [signups, period])

  const progression = previousTotal > 0 ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) : 0
  const isPositive = progression >= 0

  const formatNumber = (value: number) => {
    if (value === 0) return '0 FCFA'
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M FCFA`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K FCFA`
    return `${value} FCFA`
  }

  const periodLabels = {
    today: "Aujourd'hui",
    week: 'Semaine (7j)',
    month: 'Mois (30j)',
    year: 'Année (365j)'
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-panel border border-line p-3 rounded text-xs">
          <p className="font-medium text-gold mb-1">{payload[0].payload.date}</p>
          <p className="text-muted">
            Actuel : <span className="text-gold font-medium">{formatNumber(payload[0].value)}</span>
          </p>
          {payload[0].payload.previous > 0 && (
            <p className="text-muted mt-1">
              Précédent : <span className="font-medium">{formatNumber(payload[0].payload.previous)}</span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <section className="border border-line p-6 mb-8">
      {/* En-tête avec titre et sélecteur de période */}
      <div className="flex items-center justify-between mb-6">
        <p className="eyebrow">Revenus totaux</p>
        <div className="flex items-center gap-2">
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs font-semibold px-3 py-2 border transition-all ${
                period === p
                  ? 'bg-gold text-ink border-gold'
                  : 'bg-transparent text-muted border-line hover:border-gold hover:text-gold'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Total et progression */}
      <div className="mb-8 pb-6 border-b border-line">
        <div className="flex items-baseline gap-3">
          <p className="font-display font-semibold text-4xl text-gold">{formatNumber(currentTotal)}</p>
          {previousTotal > 0 && (
            <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-400'}`}>
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(progression)}%</span>
            </div>
          )}
        </div>
        {previousTotal > 0 && (
          <p className="text-xs text-muted mt-2">
            Comparé à la période précédente
          </p>
        )}
      </div>

      {/* Graphique */}
      {chartData.some((d) => d.current > 0) ? (
        <div className="w-full h-80 -mx-6 px-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2620" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#8A6A1F"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#8A6A1F' }}
              />
              <YAxis
                stroke="#8A6A1F"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#8A6A1F' }}
                tickFormatter={(value) => {
                  if (value === 0) return '0'
                  return `${(value / 1000).toFixed(0)}K`
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8A6A1F', strokeWidth: 1 }} />

              {/* Ligne courante (solide, gold) */}
              <Line
                type="monotone"
                dataKey="current"
                stroke="#D4AF37"
                strokeWidth={3}
                dot={false}
                isAnimationActive={true}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-sm text-muted">Aucune donnée de revenu pour cette période.</p>
          <p className="text-xs text-muted mt-2">Les données apparaîtront quand des précommandes seront marquées comme "payées".</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-line">
        <p className="text-xs text-muted">
          Basé sur les paiements validés uniquement.
        </p>
      </div>
    </section>
  )
}