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

interface RevenueCounterProps {
  signups: Signup[]
}

export default function RevenueCounter({ signups }: RevenueCounterProps) {
  // Calculer les revenus basés sur le genre et le statut "payé"
  const totalRevenue = signups.reduce((sum, signup) => {
    if (signup.status !== 'payé') return sum
    const price = signup.gender === 'homme' ? 50000 : 40000
    return sum + price
  }, 0)

  // Formater le nombre (50000 → "50K", 250000 → "250K")
  const formatRevenue = (amount: number) => {
    if (amount === 0) return '0'
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`
    }
    return amount.toLocaleString('fr-FR')
  }

  // Compter les paiements validés par genre
  const paidCount = signups.filter((s) => s.status === 'payé').length
  const paidMen = signups.filter((s) => s.status === 'payé' && s.gender === 'homme').length
  const paidWomen = signups.filter((s) => s.status === 'payé' && s.gender === 'femme').length

  return (
    <div className="border border-gold/40 bg-gradient-to-br from-[#1A160C] to-panel p-5 flex items-center gap-6">
      <div className="flex-1">
        <p className="eyebrow mb-2">Revenus (paiements validés)</p>
        <p className="font-display font-semibold text-3xl text-gold">{formatRevenue(totalRevenue)}</p>
        <p className="text-xs text-muted mt-2">{paidCount} précommande{paidCount !== 1 ? 's' : ''} payée{paidCount !== 1 ? 's' : ''}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted mb-1">Paiements</p>
        <p className="text-sm font-medium">
          <span className="text-gold">{paidMen}</span> hommes
        </p>
        <p className="text-sm font-medium">
          <span className="text-gold">{paidWomen}</span> femmes
        </p>
      </div>
    </div>
  )
}