import Countdown from './Countdown'
import { useSignupModal } from '../context/SignupModalContext'
import { useAnalytics } from '../context/AnalyticsContext'
import { useSiteContent } from '../context/SiteContentContext'

// Fin de l'offre : dans 2 jours, 14h et 38 min à partir du chargement de la page.
// À remplacer par une vraie date fixe (ex: new Date('2026-09-15T23:59:59')) en prod.
const OFFER_END = new Date(Date.now() + (2 * 24 * 60 + 14 * 60 + 38) * 60 * 1000)

export default function Pricing() {
  const { open } = useSignupModal()
  const { trackEvent } = useAnalytics()
  const { price_current, price_original, price_women, ad_budget } = useSiteContent()

  const handleOpen = () => {
    trackEvent('signup_open')
    open()
  }

  return (
    <section id="tarif" className="border-t border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <p className="eyebrow mb-4">Offre de lancement</p>
        <div className="grid md:grid-cols-[0.8fr_1.2fr_1fr] gap-10 md:gap-8">

          <div className="border border-line p-6 order-1">
            <p className="eyebrow mb-3">Tarif actuel</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display font-semibold text-3xl">{price_current}</span>
              <span className="text-sm text-muted">FCFA</span>
            </div>
            <p className="text-sm text-muted line-through mb-5">{price_original} FCFA</p>
            <div className="border-t border-line pt-4 mb-4">
              <p className="text-sm text-muted mb-1">Tarif femmes</p>
              <p className="font-display font-medium text-lg">{price_women} FCFA</p>
            </div>
            <p className="text-xs text-muted mb-6">
              Budget pub indépendant : <span className="text-[#EDEAE0]">{ad_budget} FCFA</span>
            </p>
            <button
              onClick={handleOpen}
              className="w-full text-center text-xs font-semibold tracking-wide px-5 py-3 bg-gold text-ink"
            >
              RÉSERVER MA PLACE
            </button>
          </div>

          <div className="order-2">
            <h2 className="font-display font-semibold text-3xl md:text-4xl leading-[1.15] mb-6">
              Investissez dans un système de vente qui vous appartient.
            </h2>
            <p className="text-muted text-sm leading-relaxed max-w-md">
              Un apprentissage structuré, un accompagnement personnalisé et une communauté
              privée accessible à vie.
            </p>
          </div>

          <div className="order-3">
            <Countdown targetDate={OFFER_END} />
          </div>

        </div>
      </div>
    </section>
  )
}