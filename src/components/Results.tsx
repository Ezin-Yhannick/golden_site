import { useSiteContent } from '../context/SiteContentContext'

export default function Results() {
  const { results } = useSiteContent()

  return (
    <section id="resultats" className="border-t border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <p className="eyebrow mb-4">Les résultats des élèves</p>
        <h2 className="font-display font-semibold text-3xl mb-10">
          {results.length > 0 ? 'Ils ont lancé leur boutique et aujourd\'hui ils ne s\'arrêtent plus' : 'Vos preuves seront ajoutées ici'}
        </h2>

        {results.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-px bg-line">
            {results.map((result, index) => (
              <div key={result.id} className="aspect-[4/3] bg-ink overflow-hidden">
                <img
                  src={result.url}
                  alt={`Résultat ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-px bg-line">
            {['01', '02', '03'].map((num) => (
              <div
                key={num}
                className="aspect-[4/3] bg-ink flex items-center justify-center text-sm text-muted"
              >
                {num} · Photo résultat
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
