import { lazy, Suspense, useEffect, useState } from 'react'
import { ResetPasswordPage } from './components/shop/ResetPasswordPage'
import { StoreProvider } from './state/store'
import { Home } from './v2/Home'

// The admin panel only loads for people who open it.
const Admin = lazy(() => import('./admin/Admin'))

type Route = 'site' | 'admin' | 'reset'
const routeFromHash = (): Route => (window.location.hash.startsWith('#/admin') ? 'admin' : window.location.hash.startsWith('#/reset-password') ? 'reset' : 'site')

export default function App() {
  const [route, setRoute] = useState(routeFromHash)

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <StoreProvider>
      {route === 'reset' ? (
        <ResetPasswordPage />
      ) : route === 'admin' ? (
        <Suspense fallback={<div className="grid min-h-svh place-items-center bg-espresso text-cream">Loading admin…</div>}>
          <Admin />
        </Suspense>
      ) : (
        <Home />
      )}
    </StoreProvider>
  )
}
