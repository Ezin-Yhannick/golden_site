export interface VisitorLocation {
  country: string
  countryCode: string
}

const CACHE_KEY = 'gb_geo'

// Détecte le pays du visiteur à partir de son IP.
// Utilise ipapi.co (gratuit jusqu'à 1000 requêtes/jour) — suffisant pour démarrer.
// Mis en cache dans sessionStorage pour ne faire l'appel qu'une fois par visite.
export async function getVisitorLocation(): Promise<VisitorLocation> {
  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached) return JSON.parse(cached)

  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    const location: VisitorLocation = {
      country: data.country_name || 'Inconnu',
      countryCode: data.country_code || '',
    }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(location))
    return location
  } catch {
    return { country: 'Inconnu', countryCode: '' }
  }
}

// Transforme un code pays ISO (ex: "BJ") en emoji drapeau (🇧🇯)
export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🏳️'
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}