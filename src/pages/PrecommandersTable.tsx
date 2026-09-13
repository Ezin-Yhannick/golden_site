import { useState, useMemo } from 'react'

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

const STATUS_OPTIONS = ['à payer', 'en cours', 'payé', 'annulé']

interface PrecommandersTableProps {
  signups: Signup[]
  onStatusChange: (id: string, status: string) => void
}

export default function PrecommandersTable({ signups, onStatusChange }: PrecommandersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('') // '' = tous les statuts

  // Filtrer par statut et par recherche
  const filteredSignups = useMemo(() => {
    let filtered = signups

    // 1️⃣ Filtre par statut
    if (statusFilter) {
      filtered = filtered.filter((s) => s.status === statusFilter)
    }

    // 2️⃣ Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((signup) => {
        const fullnameMatch = signup.fullname.toLowerCase().includes(query)
        const phoneMatch = signup.phone.toLowerCase().includes(query)
        const statusMatch = signup.status.toLowerCase().includes(query)
        const dateMatch = signup.created_at.includes(query)
        const genderMatch = signup.gender.toLowerCase().includes(query)

        return fullnameMatch || phoneMatch || statusMatch || dateMatch || genderMatch
      })
    }

    return filtered
  }, [signups, searchQuery, statusFilter])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Compter les précommandes par statut
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    STATUS_OPTIONS.forEach((status) => {
      counts[status] = signups.filter((s) => s.status === status).length
    })
    return counts
  }, [signups])

  if (signups.length === 0) {
    return (
      <section className="border border-line p-6 mb-8">
        <p className="eyebrow mb-4">Précommandes (0)</p>
        <p className="text-sm text-muted">Aucune précommande pour le moment.</p>
      </section>
    )
  }

  return (
    <section className="border border-line p-6 mb-8">
      <div className="mb-6">
        <p className="eyebrow mb-4">Précommandes ({signups.length})</p>

        {/* Barre de recherche */}
        <input
          type="text"
          placeholder="Rechercher par nom, numéro, date, genre ou statut..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-line text-sm mb-4 placeholder:text-[#5C5849] focus:outline-none focus:border-gold"
        />

        {/* Filtres par statut */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setStatusFilter('')}
            className={`text-xs font-semibold px-3 py-2 border transition-all ${
              statusFilter === ''
                ? 'bg-gold text-ink border-gold'
                : 'bg-transparent text-muted border-line hover:border-gold hover:text-gold'
            }`}
          >
            Tous ({signups.length})
          </button>

          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-xs font-semibold px-3 py-2 border transition-all ${
                statusFilter === status
                  ? 'bg-gold text-ink border-gold'
                  : 'bg-transparent text-muted border-line hover:border-gold hover:text-gold'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
            </button>
          ))}
        </div>

        {/* Compteur des résultats */}
        {(searchQuery || statusFilter) && (
          <p className="text-xs text-muted mb-3">
            {filteredSignups.length} résultat{filteredSignups.length !== 1 ? 's' : ''} sur {signups.length}
          </p>
        )}
      </div>

      {filteredSignups.length === 0 ? (
        <p className="text-sm text-muted">Aucun résultat ne correspond à votre recherche.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-3 px-4 font-display font-semibold">Nom et Prénoms</th>
                <th className="text-left py-3 px-4 font-display font-semibold">Numéro</th>
                <th className="text-left py-3 px-4 font-display font-semibold">Date d'inscription</th>
                <th className="text-left py-3 px-4 font-display font-semibold">Genre</th>
                <th className="text-left py-3 px-4 font-display font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredSignups.map((signup) => (
                <tr key={signup.id} className="border-b border-line hover:bg-panel/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium">{signup.fullname}</p>
                    {signup.country && <p className="text-xs text-muted">{signup.country}</p>}
                  </td>
                  <td className="py-3 px-4 text-muted">{signup.phone}</td>
                  <td className="py-3 px-4 text-muted">{formatDate(signup.created_at)}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-1 bg-panel border border-line">
                      {signup.gender === 'homme' ? 'H' : 'F'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={signup.status}
                      onChange={(e) => onStatusChange(signup.id, e.target.value)}
                      className="text-xs bg-transparent border border-line px-3 py-2 focus:outline-none focus:border-gold cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-panel">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}