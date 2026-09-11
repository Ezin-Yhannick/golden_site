import { useSignupModal } from '../context/SignupModalContext'
import { useAnalytics } from '../context/AnalyticsContext'

const NAV_LINKS = [
  { label: 'Programme', href: '#programme' },
  { label: 'Tarifs', href: '#tarif' },
  { label: 'Résultats', href: '#resultats' },
]

export default function Header() {
  const { open } = useSignupModal()
  const { trackEvent } = useAnalytics()

  const handleOpen = () => {
    trackEvent('signup_open')
    open()
  }

  return (
    <header className="border-b border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <a href="#top" className="font-display font-semibold tracking-widest text-sm">
          GOLDEN BOY
        </a>
        <nav className="hidden md:flex items-center gap-10 text-sm text-muted">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-gold transition-colors">
              {link.label}
            </a>
          ))}
        </nav>
        <button
          onClick={handleOpen}
          className="text-xs font-semibold tracking-wide px-5 py-2.5 bg-gold text-ink"
        >
          S'INSCRIRE
        </button>
      </div>
    </header>
  )
}
