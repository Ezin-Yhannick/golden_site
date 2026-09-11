const POINTS = [
  'Questions et entraide entre membres',
  'Retours réguliers sur vos avancées',
  'Accès maintenu après la formation',
]

export default function Community() {
  return (
    <section className="border-t border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-[1fr_1.4fr] gap-10">
        <div>
          <p className="eyebrow mb-4">Accès à vie</p>
          <h2 className="font-display font-semibold text-3xl mb-4">
            Une communauté qui avance avec vous
          </h2>
          <p className="text-muted text-sm leading-relaxed max-w-sm">
            Échangez avec d'autres e-commerçants, posez vos questions, partagez vos résultats et
            continuez à progresser après le programme.
          </p>
        </div>
        <div className="border-t border-line divide-y divide-line">
          {POINTS.map((point) => (
            <div key={point} className="py-4 flex gap-4 text-sm">
              <span className="text-gold">—</span>
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
