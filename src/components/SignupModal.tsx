import { useState } from 'react'
import { useSignupModal } from '../context/SignupModalContext'
import { useAnalytics } from '../context/AnalyticsContext'
import { useSiteContent } from '../context/SiteContentContext'
import { supabase } from '../lib/supabaseClient'
import { getVisitorLocation } from '../lib/geo'

type Status = 'form' | 'success' | 'duplicate'

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

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
  const [status, setStatus] = useState<Status>('form')

  if (!isOpen) return null

  const resetAndClose = () => {
    setFullname('')
    setPhone('')
    setDescription('')
    setGender('')
    setStatus('form')
    close()
  }

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

    const normalizedPhone = normalizePhone(phone)

    // Vérifie si ce numéro est déjà inscrit
    const { data: existing } = await supabase
      .from('signups')
      .select('id')
      .eq('phone', normalizedPhone)
      .maybeSingle()

    if (existing) {
      setSending(false)
      setStatus('duplicate')
      return
    }

    const location = await getVisitorLocation()

    const { error: insertError } = await supabase.from('signups').insert({
      fullname,
      phone: normalizedPhone,
      description: description.trim() || null,
      country: location.country,
      gender,
      status: 'à payer',
    })

    // Sécurité supplémentaire : si deux personnes soumettent le même numéro
    // en même temps, la contrainte unique en base renverra une erreur ici.
    if (insertError) {
      setSending(false)
      if (insertError.code === '23505') {
        setStatus('duplicate')
      } else {
        setError("Une erreur est survenue, réessayez.")
      }
      return
    }

    trackEvent('whatsapp_click')

    const lines = [
      `Bonjour Golden Boy, je m'appelle ${fullname}.`,
      `Mon numéro WhatsApp : ${phone}.`,
      description.trim() ? `Ce que je recherche : ${description.trim()}` : '',
      `Je viens de m'inscrire à l'accompagnement e-commerce.`,
    ].filter(Boolean)

    const message = encodeURIComponent(lines.join(' '))
    window.open(`https://wa.me/${whatsapp_number}?text=${message}`, '_blank')

    setSending(false)
    setStatus('success')
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center px-6"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-md bg-panel border border-line p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={resetAndClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 text-muted hover:text-gold text-sm"
        >
          ✕
        </button>

        {status === 'success' && (
          <div className="text-center py-6">
            <p className="text-4xl mb-4">✅</p>
            <h2 className="font-display font-semibold text-2xl mb-3">Inscription réussie !</h2>
            <p className="text-sm text-muted mb-6">
              Votre précommande a bien été enregistrée. Vous allez être redirigé vers WhatsApp
              pour finaliser avec nous.
            </p>
            <button
              onClick={resetAndClose}
              className="w-full text-xs font-semibold tracking-wide px-5 py-3 bg-gold text-ink"
            >
              FERMER
            </button>
          </div>
        )}

        {status === 'duplicate' && (
          <div className="text-center py-6">
            <p className="text-4xl mb-4">⚠️</p>
            <h2 className="font-display font-semibold text-2xl mb-3">Déjà inscrit(e)</h2>
            <p className="text-sm text-muted mb-6">
              Ce numéro WhatsApp est déjà enregistré chez nous. Notre équipe vous contactera
              bientôt — pas besoin de vous réinscrire.
            </p>
            <button
              onClick={resetAndClose}
              className="w-full text-xs font-semibold tracking-wide px-5 py-3 bg-gold text-ink"
            >
              FERMER
            </button>
          </div>
        )}

        {status === 'form' && (
          <>
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
              {sending ? 'VÉRIFICATION...' : 'ENVOYER SUR WHATSAPP'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}