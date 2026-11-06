import { useState } from 'react'
import { Password, Profile } from '../components/shop/AccountPanel'
import { AuthPanel } from '../components/shop/AuthPanel'
import { Avatar } from '../components/shop/ui'
import { Logo } from '../v2/Brand'
import { Panels } from '../components/shop/Panels'
import { useStore } from '../state/store'
import { CustomersAdmin } from './CustomersAdmin'
import { MenuAdmin } from './MenuAdmin'
import { OrdersAdmin } from './OrdersAdmin'
import { ReservationsAdmin } from './ReservationsAdmin'
import { Overview } from './Overview'
import { SiteAdmin } from './SiteAdmin'

const TABS = [
  { id: 'overview', label: 'Overview', note: 'Today at a glance' },
  { id: 'orders', label: 'Orders', note: 'Prepare and hand over orders' },
  { id: 'reservations', label: 'Reservations', note: 'Table bookings and newsletter' },
  { id: 'menu', label: 'Menu & prices', note: 'Drinks, beans, photos and prices' },
  { id: 'website', label: 'Website text', note: 'Words, contact details and reviews' },
  { id: 'customers', label: 'Customers', note: 'Accounts and password resets' },
  { id: 'profile', label: 'My profile', note: 'Your photo, details and password' },
] as const
export type Tab = (typeof TABS)[number]['id']

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }

export default function Admin() {
  const { user, logout, panel } = useStore()
  const [tab, setTab] = useState<Tab>('overview')
  const [navOpen, setNavOpen] = useState(false)

  // Not signed in: the same sign-in form as the website, over the cream admin background.
  if (!user) {
    return (
      <div className="min-h-svh bg-cream">
        <span aria-hidden className="fixed top-[12%] right-[10%] size-40 rounded-full bg-[radial-gradient(circle_at_35%_30%,#e08a63,#c0623b_55%,#8e4326)] opacity-80" />
        <span aria-hidden className="fixed bottom-[10%] left-[8%] size-24 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fffaf4,#e8dccd_60%,#cdb9a4)]" />
        {panel === 'forgot' || panel === 'admin-reset' ? <Panels /> : <AuthPanel mode="login" onClose={() => { window.location.hash = '#top' }} />}
      </div>
    )
  }
  if (user.role !== 'admin') {
    return (
      <div className="grid min-h-svh place-items-center bg-cream px-4 text-center text-espresso">
        <div>
          <h1 className="font-display text-5xl font-[900]">Admin access only</h1>
          <p className="mt-3 text-latte">You're signed in as {user.email}, which is a customer account.</p>
          <div className="mt-7 flex justify-center gap-3">
            <a href="#top" className="rounded-full bg-espresso px-6 py-3 text-sm font-semibold text-cream">Back to the website</a>
            <button onClick={logout} className="rounded-full border border-espresso px-6 py-3 text-sm font-semibold">Sign out</button>
          </div>
        </div>
      </div>
    )
  }

  const current = TABS.find((t) => t.id === tab)!
  return (
    <div className="min-h-svh bg-cream text-espresso lg:grid lg:grid-cols-[272px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col bg-cream-2 transition-transform lg:sticky lg:top-0 lg:h-svh lg:translate-x-0 ${navOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="px-7 pt-8 pb-7"><Logo size="sm" /></div>
        <nav aria-label="Admin" className="grid gap-1.5 px-4">
          {TABS.filter((t) => t.id !== 'profile').map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setNavOpen(false) }}
              aria-current={tab === t.id}
              className={`flex items-center gap-3 rounded-full px-5 py-3 text-left text-[15px] font-semibold transition ${tab === t.id ? 'bg-espresso text-cream shadow-[0_10px_24px_rgba(43,29,22,.25)]' : 'text-espresso/75 hover:bg-sand/50 hover:text-espresso'}`}
            >
              <span aria-hidden className={`size-2 rounded-full ${tab === t.id ? 'bg-terra' : 'bg-espresso/20'}`} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <div className={`flex items-center gap-3 rounded-3xl p-3 transition ${tab === 'profile' ? 'bg-espresso text-cream' : 'bg-cream'}`}>
            <button onClick={() => { setTab('profile'); setNavOpen(false) }} aria-label="My profile" className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <Avatar name={user.name} src={user.avatar} size={40} />
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name}</p><p className={`truncate text-xs ${tab === 'profile' ? 'text-cream/60' : 'text-latte'}`}>Edit my profile</p></div>
            </button>
            <button onClick={logout} aria-label="Sign out" title="Sign out" className="grid size-9 place-items-center rounded-full text-latte hover:bg-sand/60 hover:text-espresso">⎋</button>
          </div>
        </div>
      </aside>
      {navOpen && <div className="fixed inset-0 z-30 bg-espresso/30 lg:hidden" onClick={() => setNavOpen(false)} />}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex flex-wrap items-end justify-between gap-4 bg-cream/85 px-5 pt-6 pb-5 backdrop-blur-xl sm:px-10 sm:pt-8">
          <div className="flex items-end gap-3">
            <button aria-label="Open menu" onClick={() => setNavOpen(true)} className="mb-1 grid size-10 place-items-center rounded-full bg-cream-2 lg:hidden">☰</button>
            <div>
              <p className="text-sm text-latte">{tab === 'overview' ? `${greeting()}, ${user.name.split(' ')[0]}` : current.note}</p>
              <h1 className="font-display text-4xl leading-none font-[900] tracking-tight sm:text-5xl">{current.label}</h1>
            </div>
          </div>
          <a href="#top" className="rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-cream transition hover:scale-[1.04]">View website ↗</a>
        </header>
        <main className="px-5 pt-2 pb-12 sm:px-10">
          {tab === 'overview' && <Overview go={setTab} />}
          {tab === 'orders' && <OrdersAdmin />}
          {tab === 'reservations' && <ReservationsAdmin />}
          {tab === 'menu' && <MenuAdmin />}
          {tab === 'website' && <SiteAdmin />}
          {tab === 'customers' && <CustomersAdmin />}
          {tab === 'profile' && (
            <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
              <section className="rounded-3xl bg-white p-7 shadow-[0_12px_32px_rgba(43,29,22,.07)]"><h2 className="mb-5 font-display text-2xl font-[800] tracking-tight">Photo &amp; details</h2><Profile /></section>
              <section className="rounded-3xl bg-white p-7 shadow-[0_12px_32px_rgba(43,29,22,.07)]"><h2 className="mb-5 font-display text-2xl font-[800] tracking-tight">Password</h2><Password /></section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
