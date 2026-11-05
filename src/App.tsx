import { lazy, Suspense, useEffect, useState } from 'react'
import { BeanIntro } from './components/BeanIntro'
import { Cta } from './components/Cta'
import { Features } from './components/Features'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Panels } from './components/shop/Panels'
import { Signature } from './components/Signature'
import { Stats } from './components/Stats'
import { Story } from './components/Story'
import { StoreProvider } from './state/store'

// The admin panel only loads for people who open it.
const Admin = lazy(() => import('./admin/Admin'))

const isAdminRoute = () => window.location.hash.startsWith('#/admin')

function Site() {
  // The 3D bean intro stays until the visitor clicks, then the site shows straight away.
  const [entered, setEntered] = useState(() => sessionStorage.getItem('sipsoul-entered') === '1')

  useEffect(() => {
    document.body.style.overflow = entered ? '' : 'hidden'
    if (!entered) window.scrollTo(0, 0)
  }, [entered])

  if (!entered) return <BeanIntro onEnter={() => { sessionStorage.setItem('sipsoul-entered', '1'); setEntered(true) }} />

  return (
    <>
      <Header />
      <main>
        <Hero show />
        <Features />
        <Signature />
        <Story />
        <Stats />
        <Cta />
      </main>
      <Footer />
      <Panels />
    </>
  )
}

export default function App() {
  const [admin, setAdmin] = useState(isAdminRoute)

  useEffect(() => {
    const onHash = () => setAdmin(isAdminRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <StoreProvider>
      {admin ? (
        <Suspense fallback={<div className="grid min-h-svh place-items-center bg-espresso text-cream">Loading admin…</div>}>
          <Admin />
        </Suspense>
      ) : (
        <Site />
      )}
    </StoreProvider>
  )
}
