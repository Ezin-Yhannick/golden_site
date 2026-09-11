import { useSiteContent } from '../context/SiteContentContext'
import { useSignupModal } from '../context/SignupModalContext'
import { useAnalytics } from '../context/AnalyticsContext'

const FEATURES = [
  {
    number: '01',
    title: 'Une boutique solide',
    description: 'Shopify configuré étape par étape.',
  },
  {
    number: '02',
    title: 'Des campagnes maîtrisées',
    description: 'Facebook Ads et TikTok Ads sans improvisation.',
  },
  {
    number: '03',
    title: 'Un suivi réel',
    description: 'Des réponses, des retours et une communauté à vie.',
  },
]

export default function Hero() {
  const { heroPhoto } = useSiteContent()
  const { open } = useSignupModal()
  const { trackEvent } = useAnalytics()

  const handleOpen = () => {
    trackEvent('signup_open')
    open()
  }

  return (
    <section
      id="top"
      className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-[1fr_1.1fr_0.9fr] gap-12 md:gap-10 items-start"
    >
      <div>
        <p className="eyebrow mb-6">Accompagnement e-commerce · Dropshipping · Entrepreneuriat</p>
        <h1 className="font-display font-semibold text-6xl leading-[1.02] text-gold mb-6">
          Golden
          <br />
          Boy
        </h1>
        <p className="text-muted text-base leading-relaxed mb-10 max-w-xs">
          Passez de l'idée à votre première boutique, avec une méthode claire et un véritable
          suivi.
        </p>
        <div className="border-t border-line pt-5 flex flex-wrap items-center gap-6">
          <button
            onClick={handleOpen}
            className="text-xs font-semibold tracking-wide px-5 py-2.5 bg-gold text-ink"
          >
            S'INSCRIRE
          </button>
          <a
            href="#programme"
            className="text-xs font-semibold tracking-wide inline-flex items-center gap-2 hover:text-gold transition-colors"
          >
            DÉCOUVRIR LE PROGRAMME <span>→</span>
          </a>
        </div>
      </div>

      <div className="relative">
        <div className="aspect-[4/5] border border-line bg-panel flex items-center justify-center text-center px-6 overflow-hidden">
          {heroPhoto ? (
            <img src={heroPhoto} alt="Golden Boy" className="w-full h-full object-cover" />
          ) : (
            <div>
              <p className="font-display text-5xl text-[#3A3628] mb-6">GB</p>
              <p className="text-sm">Photo de Golden Boy</p>
              <p className="text-xs text-muted mt-1">Portrait vertical à ajouter ici</p>
            </div>
          )}
        </div>
        <div className="bg-gold text-ink px-6 py-4 flex items-center justify-between -mt-px">
          <span className="text-xs font-bold tracking-wide">CONSTRUISEZ VOTRE SYSTÈME</span>
          <span className="text-xs font-bold border-l border-ink/30 pl-4">2026</span>
        </div>
      </div>

      <div className="border-t border-line divide-y divide-line">
        {FEATURES.map((feature) => (
          <div key={feature.number} className="py-6">
            <p className="eyebrow mb-2">{feature.number}</p>
            <h3 className="font-display font-medium text-lg mb-1">{feature.title}</h3>
            <p className="text-sm text-muted">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
