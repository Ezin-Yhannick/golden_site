import { useEffect, useState, useRef } from 'react'
import { SiteContentProvider } from './context/SiteContentContext'
import { SignupModalProvider } from './context/SignupModalContext'
import { AnalyticsProvider, useAnalytics } from './context/AnalyticsContext'
import Header from './components/Header'
import Hero from './components/Hero'
import Pricing from './components/Pricing'
import Programme from './components/Programme'
import Community from './components/Community'
import Results from './components/Results'
import Footer from './components/Footer'
import SignupModal from './components/SignupModal'
import AdminPage from './pages/AdminPage'

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return hash
}

function MainSite() {
  const { trackPageView } = useAnalytics()
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    trackPageView()
  }, [trackPageView])

  return (
    <div className="antialiased">
      <Header />
      <Hero />
      <Pricing />
      <Programme />
      <Community />
      <Results />
      <Footer />
      <SignupModal />
    </div>
  )
}

export default function App() {
  const hash = useHashRoute()
  const isAdmin = hash === '#admin'

  return (
    <AnalyticsProvider>
      <SiteContentProvider>
        <SignupModalProvider>
          {isAdmin ? <AdminPage /> : <MainSite />}
        </SignupModalProvider>
      </SiteContentProvider>
    </AnalyticsProvider>
  )
}
