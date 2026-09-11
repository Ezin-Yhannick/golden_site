import { useState, useMemo } from 'react'

interface Signup {
  id: string
  fullname: string
  phone: string
  description: string | null
  country: string | null
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

  // Filtrer les données selon la recherche
  const filteredSignups = useMemo(() => {
    if (!searchQuery.trim()) return signups

    const query = searchQuery.toLowerCase().trim()

    return signups.filter((signup) => {
      const fullnameMatch = signup.fullname.toLowerCase().includes(query)
      const phoneMatch = signup.phone.toLowerCase().includes(query)
      const statusMatch = signup.status.toLowerCase().includes(query)
      const dateMatch = signup.created_at.includes(query)

      return fullnameMatch || phoneMatch || statusMatch || dateMatch
    })
  }, [signups, searchQuery])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

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
          placeholder="Rechercher par nom, numéro, date ou statut..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-line text-sm mb-4 placeholder:text-[#5C5849] focus:outline-none focus:border-gold"
        />

        {/* Compteur des résultats */}
        {searchQuery && (
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