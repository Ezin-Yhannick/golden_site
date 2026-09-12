import { useMemo } from 'react'
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

export default function RevenueChart({ signups }: RevenueChartProps) {
  const chartData = useMemo(() => {
    // Filtrer seulement les paiements validés
    const paidSignups = signups.filter((s) => s.status === 'payé')

    // Grouper par date
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

    // Générer les 7 derniers jours
    const today = new Date()
    const dates: Array<{ date: string; current: number }> = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })

      const dayOfWeek = d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3)
      const dayNum = d.getDate()

      dates.push({
        date: `${dayNum} ${dayOfWeek}`,
        current: revenueByDate[dateStr] || 0
      })
    }

    return dates
  }, [signups])

  // Calculer les totaux
  const currentTotal = chartData.reduce((sum, d) => sum + d.current, 0)
  const paidCount = signups.filter((s) => s.status === 'payé').length

  const formatNumber = (value: number) => {
    if (value === 0) return '0 FCFA'
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M FCFA`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K FCFA`
    return `${value} FCFA`
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-panel border border-line p-3 rounded text-xs">
          <p className="font-medium text-gold">{payload[0].payload.date}</p>
          <p className="text-muted">{formatNumber(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <section className="border border-line p-6 mb-8">
      <div className="mb-8">
        <p className="eyebrow mb-3">Revenus totaux (7 derniers jours)</p>
        <div className="flex items-baseline gap-3">
          <p className="font-display font-semibold text-4xl text-gold">{formatNumber(currentTotal)}</p>
          <span className="text-sm text-muted">({paidCount} paiement{paidCount > 1 ? 's' : ''})</span>
        </div>
      </div>

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
          <p className="text-sm text-muted">Aucune donnée de revenu pour les 7 derniers jours.</p>
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