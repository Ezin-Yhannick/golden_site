import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface ResultItem {
  id: string
  url: string
}

export interface SiteContentFields {
  hero_photo_url: string | null
  price_current: string
  price_original: string
  price_women: string
  ad_budget: string
  whatsapp_number: string
}

interface SiteContentContextValue extends SiteContentFields {
  results: ResultItem[]
  loading: boolean
  uploadHeroPhoto: (file: File) => Promise<void>
  removeHeroPhoto: () => Promise<void>
  addResult: (file: File) => Promise<void>
  removeResult: (id: string) => Promise<void>
  updateContent: (fields: Partial<SiteContentFields>) => Promise<void>
}

const DEFAULT_CONTENT: SiteContentFields = {
  hero_photo_url: null,
  price_current: '50 000',
  price_original: '100 000',
  price_women: '40 000',
  ad_budget: '15 000',
  whatsapp_number: '2290195961268',
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null)

async function uploadToStorage(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('photos').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContentFields>(DEFAULT_CONTENT)
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    const [{ data: row }, { data: resultRows }] = await Promise.all([
      supabase
        .from('site_content')
        .select('hero_photo_url, price_current, price_original, price_women, ad_budget, whatsapp_number')
        .eq('id', 1)
        .single(),
      supabase.from('results').select('id, image_url').order('created_at', { ascending: false }),
    ])
    if (row) setContent({ ...DEFAULT_CONTENT, ...row })
    setResults((resultRows ?? []).map((r) => ({ id: r.id, url: r.image_url })))
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()

    // Synchro en temps réel : dès qu'un admin modifie le contenu, tous les
    // visiteurs connectés voient le changement sans recharger la page.
    const channel = supabase
      .channel('site-content-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, fetchAll)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const updateContent = async (fields: Partial<SiteContentFields>) => {
    const { error } = await supabase.from('site_content').update(fields).eq('id', 1)
    if (error) throw error
    setContent((prev) => ({ ...prev, ...fields }))
  }

  const uploadHeroPhoto = async (file: File) => {
    const url = await uploadToStorage(file, 'hero')
    await updateContent({ hero_photo_url: url })
  }

  const removeHeroPhoto = async () => {
    await updateContent({ hero_photo_url: null })
  }

  const addResult = async (file: File) => {
    const url = await uploadToStorage(file, 'results')
    const { error } = await supabase.from('results').insert({ image_url: url })
    if (error) throw error
    await fetchAll()
  }

  const removeResult = async (id: string) => {
    const { error } = await supabase.from('results').delete().eq('id', id)
    if (error) throw error
    setResults((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <SiteContentContext.Provider
      value={{
        ...content,
        results,
        loading,
        uploadHeroPhoto,
        removeHeroPhoto,
        addResult,
        removeResult,
        updateContent,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  )
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext)
  if (!ctx) throw new Error('useSiteContent doit être utilisé dans SiteContentProvider')
  return ctx
}