import { useState, useEffect, ChangeEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { useSiteContent } from '../context/SiteContentContext'
import { useAnalytics } from '../context/AnalyticsContext'
import { countryCodeToFlag } from '../lib/geo'
import PrecommandersTable from './PrecommandersTable'
import RevenueChart from '../components/RevenueChart'
import RevenueCounter from '../components/RevenueCounter'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      console.error('Erreur de connexion Supabase :', error)
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full border border-line p-8 text-center">
        <p className="eyebrow mb-4">Espace privé</p>
        <h1 className="font-display font-semibold text-2xl mb-6">Accès admin</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 bg-transparent border border-line text-center mb-2 placeholder:text-[#5C5849] focus:outline-none focus:border-gold"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="Mot de passe"
          className="w-full px-4 py-3 bg-transparent border border-line text-center mb-2 placeholder:text-[#5C5849] focus:outline-none focus:border-gold"
        />
        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full text-xs font-semibold tracking-wide px-5 py-3 bg-gold text-ink disabled:opacity-50"
        >
          {loading ? 'CONNEXION...' : 'SE CONNECTER'}
        </button>
        <a href="#top" className="block text-xs text-muted mt-6 hover:text-gold">
          ← Retour au site
        </a>
      </div>
    </div>
  )
}

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

function Dashboard() {
  const { heroPhoto, results, uploadHeroPhoto, removeHeroPhoto, addResult, removeResult } =
    useSiteContent()
  const { fetchStats } = useAnalytics()

  const [stats, setStats] = useState<{
    totalViews: number
    events: Record<string, number>
    last7Days: { date: string; count: number }[]
    byCountry: { country: string; countryCode: string; count: number }[]
  }>({ totalViews: 0, events: {}, last7Days: [], byCountry: [] })
  const [busy, setBusy] = useState(false)
  const [signups, setSignups] = useState<Signup[]>([])

  const fetchSignups = async () => {
    const { data } = await supabase
      .from('signups')
      .select('*')
      .order('created_at', { ascending: false })
    setSignups(data || [])
  }

  useEffect(() => {
    fetchStats().then(setStats)
    fetchSignups()
  }, [fetchStats])

  const updateStatus = async (id: string, status: string) => {
    setSignups((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
    await supabase.from('signups').update({ status }).eq('id', id)
  }

  const handleHeroUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      await uploadHeroPhoto(file)
    } finally {
      setBusy(false)
    }
  }

  const handleResultUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setBusy(true)
    try {
      for (const file of Array.from(files)) {
        await addResult(file)
      }
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <h1 className="font-display font-semibold text-2xl">Admin — Golden Boy</h1>
        <div className="flex items-center gap-4">
          <a href="#top" className="text-xs text-muted hover:text-gold">
            ← Retour au site
          </a>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-muted hover:text-red-400"
          >
            Se déconnecter
          </button>
        </div>
      </div>

      <section className="border border-line p-6 mb-8">
        <p className="eyebrow mb-4">Statistiques (tous visiteurs confondus)</p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="border border-line p-4">
            <p className="text-xs text-muted mb-1">Vues (7 derniers jours)</p>
            <p className="font-display font-semibold text-2xl">{stats.totalViews}</p>
          </div>
          <div className="border border-line p-4">
            <p className="text-xs text-muted mb-1">Ouvertures inscription</p>
            <p className="font-display font-semibold text-2xl">{stats.events.signup_open || 0}</p>
          </div>
          <div className="border border-line p-4">
            <p className="text-xs text-muted mb-1">Envois WhatsApp</p>
            <p className="font-display font-semibold text-2xl">{stats.events.whatsapp_click || 0}</p>
          </div>
        </div>

        <p className="text-xs text-muted mb-3">Trafic des 7 derniers jours</p>
        <div className="flex items-end gap-3 h-32">
          {stats.last7Days.map((day) => {
            const max = Math.max(...stats.last7Days.map((d) => d.count), 1)
            const heightPct = (day.count / max) * 100
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full bg-gold"
                    style={{ height: `${Math.max(heightPct, day.count > 0 ? 6 : 0)}%` }}
                    title={`${day.count} vue(s)`}
                  />
                </div>
                <span className="text-[10px] text-muted">{day.date.slice(5)}</span>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-muted mt-8 mb-4">Visiteurs par pays</p>
        {stats.byCountry.length === 0 ? (
          <p className="text-sm text-muted">Pas encore de données.</p>
        ) : (
          <div>
            {/* Podium : le pays n°1 mis en avant */}
            <div className="border border-gold/40 bg-gradient-to-br from-[#1A160C] to-panel p-5 mb-4 flex items-center gap-4">
              <span className="text-4xl leading-none">
                {countryCodeToFlag(stats.byCountry[0].countryCode)}
              </span>
              <div className="flex-1">
                <p className="eyebrow mb-1">Top pays</p>
                <p className="font-display font-semibold text-xl">{stats.byCountry[0].country}</p>
              </div>
              <div className="text-right">
                <p className="font-display font-semibold text-2xl text-gold">
                  {stats.byCountry[0].count}
                </p>
                <p className="text-xs text-muted">
                  {Math.round(
                    (stats.byCountry[0].count /
                      stats.byCountry.reduce((sum, c) => sum + c.count, 0)) *
                      100
                  )}
                  % du trafic
                </p>
              </div>
            </div>

            {/* Classement des autres pays */}
            <div className="space-y-3">
              {stats.byCountry.map((c, index) => {
                const total = stats.byCountry.reduce((sum, x) => sum + x.count, 0)
                const pct = Math.round((c.count / total) * 100)
                return (
                  <div key={c.country} className="flex items-center gap-3">
                    <span className="text-xs text-muted w-4 shrink-0">{index + 1}</span>
                    <span className="text-lg shrink-0">{countryCodeToFlag(c.countryCode)}</span>
                    <span className="text-sm w-24 shrink-0 truncate">{c.country}</span>
                    <div className="flex-1 h-2 bg-line overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8A6A1F] to-gold transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted w-10 text-right">{c.count}</span>
                    <span className="text-xs text-gold w-10 text-right">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      
       <section className="mb-8">
        <RevenueCounter signups={signups} />
      </section>

      <RevenueChart signups={signups} />

         <PrecommandersTable 
          signups={signups} 
          onStatusChange={updateStatus}
        />

      <section className="border border-line p-6 mb-8">
        <p className="eyebrow mb-4">Photo hero</p>
        <div className="flex items-center gap-6">
          <div className="w-24 h-32 border border-line bg-panel flex items-center justify-center overflow-hidden shrink-0">
            {heroPhoto ? (
              <img src={heroPhoto} alt="Aperçu" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-muted">Aucune</span>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wide px-4 py-2 bg-gold text-ink cursor-pointer inline-block mb-2">
              {busy ? 'ENVOI...' : 'CHANGER LA PHOTO'}
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroUpload}
                disabled={busy}
                className="hidden"
              />
            </label>
            {heroPhoto && (
              <button
                onClick={() => removeHeroPhoto()}
                className="block text-xs text-muted hover:text-red-400"
              >
                Retirer la photo
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="border border-line p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="eyebrow">Résultats des élèves ({results.length})</p>
          <label className="text-xs font-semibold tracking-wide px-4 py-2 bg-gold text-ink cursor-pointer">
            {busy ? 'ENVOI...' : 'AJOUTER DES PHOTOS'}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleResultUpload}
              disabled={busy}
              className="hidden"
            />
          </label>
        </div>

        {results.length === 0 ? (
          <p className="text-sm text-muted">Aucun résultat ajouté pour le moment.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {results.map((result) => (
              <div key={result.id} className="relative group">
                <div className="aspect-[4/3] border border-line overflow-hidden">
                  <img src={result.url} alt="" className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => removeResult(result.id)}
                  className="absolute top-1 right-1 text-xs bg-ink/80 text-red-400 px-2 py-1"
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (checking) return null
  return session ? <Dashboard /> : <LoginForm />
}