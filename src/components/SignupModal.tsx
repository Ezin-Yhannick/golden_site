import { useState } from 'react'
import { useSignupModal } from '../context/SignupModalContext'
import { useAnalytics } from '../context/AnalyticsContext'
import { supabase } from '../lib/supabaseClient'
import { getVisitorLocation } from '../lib/geo'

type MessageType = 'success' | 'error' | 'warning'

export default function SignupModal() {
  const { isOpen, close } = useSignupModal()
  const { trackEvent } = useAnalytics()

  const [fullname, setFullname] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [gender, setGender] = useState<'homme' | 'femme' | ''>('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState<{ type: MessageType; text: string } | null>(null)
  const [sending, setSending] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!fullname.trim() || !phone.trim()) {
      setError('Renseignez votre nom et votre numéro WhatsApp.')
      setMessage(null)
      return
    }
    if (!gender) {
      setError('Sélectionnez votre genre.')
      setMessage(null)
      return
    }
    setError('')
    setSending(true)
    setMessage(null)

    try {
      // 1️⃣ Vérifier si ce numéro est déjà inscrit
      const { data: existingSignup, error: checkError } = await supabase
        .from('signups')
        .select('id, fullname, status')
        .eq('phone', phone)
        .single()

      if (existingSignup) {
        // Le numéro existe déjà
        setSending(false)
        setMessage({
          type: 'warning',
          text: `Vous êtes déjà inscrit sous le nom "${existingSignup.fullname}" avec le statut "${existingSignup.status}". Veuillez contacter le support si vous avez besoin de modifier vos informations.`
        })
        return
      }

      // 2️⃣ Le numéro n'existe pas, créer une nouvelle inscription
      const location = await getVisitorLocation()

      const { error: insertError } = await supabase.from('signups').insert({
        fullname,
        phone,
        description: description.trim() || null,
        country: location.country,
        gender,
        status: 'à payer',
      })

      if (insertError) {
        setSending(false)
        setMessage({
          type: 'error',
          text: 'Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.'
        })
        return
      }

      // 3️⃣ Succès ! Envoyer le message WhatsApp
      trackEvent('whatsapp_click')

      const lines = [
        `Bonjour Golden Boy, je m'appelle ${fullname}.`,
        `Mon numéro WhatsApp : ${phone}.`,
        description.trim() ? `Ce que je recherche : ${description.trim()}` : '',
        `Je viens de m'inscrire à l'accompagnement e-commerce.`,
      ].filter(Boolean)

      const whatsappNumber = '229195961268'
      const messageText = encodeURIComponent(lines.join(' '))

      window.open(`https://wa.me/${whatsappNumber}?text=${messageText}`, '_blank')

      setSending(false)
      setMessage({
        type: 'success',
        text: '✅ Inscription réussie ! Vous allez être redirigé vers WhatsApp pour finaliser votre pré-commande.'
      })

      // Ferme la modal après 3 secondes
      setTimeout(() => {
        setFullname('')
        setPhone('')
        setDescription('')
        setGender('')
        setMessage(null)
        close()
      }, 3000)
    } catch (err) {
      setSending(false)
      setMessage({
        type: 'error',
        text: 'Une erreur inattendue est survenue. Veuillez réessayer.'
      })
    }
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
            disabled={sending}
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Votre numéro WhatsApp"
            className="w-full px-4 py-3 bg-transparent border border-line focus:outline-none focus:border-gold placeholder:text-[#5C5849]"
            disabled={sending}
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'homme' | 'femme')}
            className="w-full px-4 py-3 bg-transparent border border-line focus:outline-none focus:border-gold text-[#5C5849]"
            disabled={sending}
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
            disabled={sending}
          />
        </div>

        {/* Messages de feedback */}
        {error && (
          <p className="text-xs text-red-400 mt-3 text-left">{error}</p>
        )}

        {message && (
          <div
            className={`mt-3 p-3 rounded text-xs text-left ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                : message.type === 'warning'
                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                : 'bg-red-400/10 text-red-400 border border-red-400/30'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={sending || !!message?.type}
          className="w-full mt-5 text-xs font-semibold tracking-wide px-5 py-3 bg-gold text-ink disabled:opacity-50"
        >
          {sending ? 'VÉRIFICATION...' : 'ENVOYER SUR WHATSAPP'}
        </button>
      </div>
    </div>
  )
}