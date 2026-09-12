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

    // Générer les 14 derniers jours
    const today = new Date()
    const dates: Array<{ date: string; current: number; previous: number }> = []

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })

      const dayOfWeek = d.toLocaleDateString('fr-FR', { weekday: 'short' })
      const dayNum = d.getDate()

      const current = i < 7 ? revenueByDate[dateStr] || 0 : 0
      const previous = i >= 7 ? revenueByDate[dateStr] || 0 : 0

      // Affiche seulement les 7 derniers jours (mais calcule les 7 précédents en arrière-plan)
      if (i < 7) {
        dates.push({
          date: `${dayNum} ${dayOfWeek}`,
          current,
          previous: revenueByDate[dateStr] || 0 // Récupère la valeur précédente si elle existe
        })
      }
    }

    return dates
  }, [signups])

  // Calculer les totaux et progression
  const currentTotal = chartData.reduce((sum, d) => sum + d.current, 0)
  const previousTotal = signups
    .filter((s) => {
      const d = new Date(s.created_at)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff >= 7 && daysDiff < 14 && s.status === 'payé'
    })
    .reduce((sum, s) => sum + (s.gender === 'homme' ? 50000 : 40000), 0)

  const progression = previousTotal > 0 ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) : 0
  const isPositive = progression >= 0

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
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="eyebrow mb-3">Revenus totaux (7 derniers jours)</p>
          <div className="flex items-baseline gap-3">
            <p className="font-display font-semibold text-4xl">{formatNumber(currentTotal)}</p>
            {previousTotal > 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-400'}`}>
                <span>{isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(progression)}%</span>
              </div>
            )}
          </div>
          {previousTotal > 0 && (
            <p className="text-xs text-muted mt-2">
              Comparé aux 7 jours précédents
            </p>
          )}
        </div>
      </div>

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
                return `${(value / 1000000).toFixed(0)}M`
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
              name="Revenus actuels"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-6 border-t border-line">
        <p className="text-xs text-muted">
          Taux de croissance calculé sur la base des paiements validés uniquement.
        </p>
      </div>
    </section>
  )
}