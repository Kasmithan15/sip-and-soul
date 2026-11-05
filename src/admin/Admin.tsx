import { useState } from 'react'
import { BeanSolid } from '../components/Icons'
import { AuthPanel } from '../components/shop/AuthPanel'
import { useStore } from '../state/store'
import { CustomersAdmin } from './CustomersAdmin'
import { MenuAdmin } from './MenuAdmin'
import { OrdersAdmin } from './OrdersAdmin'
import { Overview } from './Overview'
import { SiteAdmin } from './SiteAdmin'

const TABS = [
  { id: 'overview', label: 'Overview', icon: '◎' },
  { id: 'orders', label: 'Orders', icon: '☕' },
  { id: 'menu', label: 'Menu & prices', icon: '☰' },
  { id: 'website', label: 'Website text', icon: '✎' },
  { id: 'customers', label: 'Customers', icon: '☺' },
] as const
export type Tab = (typeof TABS)[number]['id']

export default function Admin() {
  const { user, logout } = useStore()
  const [tab, setTab] = useState<Tab>('overview')
  const [navOpen, setNavOpen] = useState(false)

  // Not signed in: the same sign-in form as the website, over the admin background.
  if (!user) {
    return (
      <div className="min-h-svh bg-espresso">
        <AuthPanel mode="login" onClose={() => { window.location.hash = '#home' }} />
      </div>
    )
  }
  if (user.role !== 'admin') {
    return (
      <div className="grid min-h-svh place-items-center bg-espresso px-4 text-center text-cream">
        <div>
          <h1 className="font-serif text-3xl">Admin access only</h1>
          <p className="mt-2 text-cream/70">You're signed in as {user.email}, which is a customer account.</p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="#home" className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-roast">Back to the website</a>
            <button onClick={logout} className="rounded-full border border-cream/40 px-5 py-2.5 text-sm">Sign out</button>
          </div>
        </div>
      </div>
    )
  }

  const current = TABS.find((t) => t.id === tab)!
  return (
    <div className="min-h-svh bg-[#f7f2ec] text-brown lg:grid lg:grid-cols-[250px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-[250px] bg-espresso text-cream transition-transform lg:static lg:translate-x-0 ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <BeanSolid className="size-6 text-gold" />
          <div className="leading-tight">
            <p className="font-serif tracking-[.18em]">SIP &amp; SOUL</p>
            <p className="text-[10px] tracking-[.3em] text-gold">ADMIN</p>
          </div>
        </div>
        <nav className="grid gap-1 p-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setNavOpen(false) }}
              aria-current={tab === t.id}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition ${tab === t.id ? 'bg-gold text-roast' : 'text-cream/80 hover:bg-white/5 hover:text-cream'}`}
            >
              <span aria-hidden className="w-4 text-center">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-4 text-xs text-cream/60">
          <p className="truncate">{user.email}</p>
          <button onClick={logout} className="mt-2 text-cream/80 hover:text-gold">Sign out</button>
        </div>
      </aside>
      {navOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setNavOpen(false)} />}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-[#f7f2ec]/90 px-5 py-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button aria-label="Open menu" onClick={() => setNavOpen(true)} className="text-2xl lg:hidden">☰</button>
            <h1 className="font-serif text-2xl text-roast">{current.label}</h1>
          </div>
          <a href="#home" className="rounded-full border border-line bg-white px-4 py-2 text-sm text-roast transition hover:border-mocha">View website ↗</a>
        </header>
        <main className="p-5 sm:p-8">
          {tab === 'overview' && <Overview go={setTab} />}
          {tab === 'orders' && <OrdersAdmin />}
          {tab === 'menu' && <MenuAdmin />}
          {tab === 'website' && <SiteAdmin />}
          {tab === 'customers' && <CustomersAdmin />}
        </main>
      </div>
    </div>
  )
}
