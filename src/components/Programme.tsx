const SKILLS = [
  'Trouver un produit avec du potentiel',
  'Trouver un fournisseur fiable',
  'Créer et configurer votre boutique Shopify',
  'Mettre en place votre système de commande',
  'Créer des publicités efficaces',
  'Maîtriser Facebook Ads & TikTok Ads',
  'Lancer et analyser vos premières campagnes',
  'Confirmer et gérer vos commandes',
  'Optimiser progressivement vos résultats',
]

export default function Programme() {
  return (
    <section id="programme" className="border-t border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="flex flex-wrap justify-between items-end gap-6 mb-12">
          <div>
            <p className="eyebrow mb-4">Le programme</p>
            <h2 className="font-display font-semibold text-3xl md:text-4xl">
              9 acquis. Une méthode.
            </h2>
          </div>
          <p className="text-muted text-sm max-w-xs">
            De la recherche produit à l'optimisation de vos premières campagnes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 border-t border-l border-line">
          {SKILLS.map((skill, index) => (
            <div key={skill} className="border-b border-r border-line p-6">
              <p className="eyebrow mb-3">{String(index + 1).padStart(2, '0')}</p>
              <p className="font-display">{skill}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
