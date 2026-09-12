import { useState } from 'react'
import { useSignupModal } from '../context/SignupModalContext'
import { useAnalytics } from '../context/AnalyticsContext'
import { supabase } from '../lib/supabaseClient'
import { getVisitorLocation } from '../lib/geo'
import { useSiteContent } from '../context/SiteContentContext'

export default function SignupModal() {
  const { isOpen, close } = useSignupModal()
  const { trackEvent } = useAnalytics()
  const { whatsapp_number } = useSiteContent()

  const [fullname, setFullname] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [gender, setGender] = useState<'homme' | 'femme' | ''>('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!fullname.trim() || !phone.trim()) {
      setError('Renseignez votre nom et votre numéro WhatsApp.')
      return
    }
    if (!gender) {
      setError('Sélectionnez votre genre.')
      return
    }
    setError('')
    setSending(true)

    const location = await getVisitorLocation()

    // Enregistre la précommande (visible dans l'admin, avec un statut à suivre)
    await supabase.from('signups').insert({
      fullname,
      phone,
      description: description.trim() || null,
      country: location.country,
      gender,
      status: 'à payer',
    })

    trackEvent('whatsapp_click')

    const lines = [
      `Bonjour Golden Boy, je m'appelle ${fullname}.`,
      `Mon numéro WhatsApp : ${phone}.`,
      description.trim() ? `Ce que je recherche : ${description.trim()}` : '',
      `Je viens de m'inscrire à l'accompagnement e-commerce.`,
    ].filter(Boolean)

    // Numéro WhatsApp Golden Boy (format international : +229...)
  
    const message = encodeURIComponent(lines.join(' '))

    window.open(`https://wa.me/${whatsapp_number}?text=${message}`, '_blank')

    setSending(false)
    setFullname('')
    setPhone('')
    setDescription('')
    setGender('')
    close()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center px-6"
      onClick={close}
    >
      <div
        className="w-full max-w-md bg-panel border border-line p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Fermer"
          className="absolute top-4 right-4 text-muted hover:text-gold text-sm"
        >
          ✕
        </button>

        <h2 className="font-display font-semibold text-2xl mb-6">Inscrivez-vous</h2>

        <div className="space-y-3">
          <input
            type="text"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Votre prénom et nom"
            className="w-full px-4 py-3 bg-transparent border border-line focus:outline-none focus:border-gold placeholder:text-[#5C5849]"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Votre numéro WhatsApp"
            className="w-full px-4 py-3 bg-transparent border border-line focus:outline-none focus:border-gold placeholder:text-[#5C5849]"
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'homme' | 'femme')}
            className="w-full px-4 py-3 bg-transparent border border-line focus:outline-none focus:border-gold text-[#5C5849]"
          >
            <option value="">Sélectionnez votre genre</option>
            <option value="homme" className="bg-panel">Homme</option>
            <option value="femme" className="bg-panel">Femme</option>
          </select>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dites-nous ce que vous recherchez (optionnel)"
            rows={3}
            className="w-full px-4 py-3 bg-transparent border border-line focus:outline-none focus:border-gold placeholder:text-[#5C5849] resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-400 mt-3 text-left">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={sending}
          className="w-full mt-5 text-xs font-semibold tracking-wide px-5 py-3 bg-gold text-ink disabled:opacity-50"
        >
          {sending ? 'ENVOI...' : 'ENVOYER SUR WHATSAPP'}
        </button>
      </div>
    </div>
  )
}