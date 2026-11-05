import { useEffect, useState } from 'react'
import { CartIcon } from '../components/Icons'
import { useStore } from '../state/store'

const links = [
  { label: 'Home', href: '#top' },
  { label: 'Recipes', href: '#recipes' },
  { label: 'Menu', href: '#menu' },
  { label: 'Visit', href: '#visit' },
]

export function Logo({ light }: { light?: boolean }) {
  return (
    <a href="#top" aria-label="Sip & Soul Café, home" className={`group flex items-baseline gap-1.5 font-display text-[22px] leading-none font-[800] tracking-tight ${light ? 'text-cream' : 'text-espresso'}`}>
      SIP<span className="mx-0.5 inline-block h-6 w-px origin-bottom rotate-[20deg] bg-current opacity-60 transition-transform group-hover:rotate-[35deg]" />SOUL
      <span className="ml-1 font-sans text-[9px] font-semibold tracking-[.35em] opacity-60">CAFÉ</span>
    </a>
  )
}

export function Nav() {
  const { user, openPanel, cartCount } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const account = () => (user?.role === 'admin' ? (window.location.hash = '#/admin') : openPanel(user ? 'account' : 'login'))

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-cream/80 py-3 shadow-[0_8px_30px_rgba(43,29,22,.06)] backdrop-blur-xl' : 'py-5'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-8 text-[15px] font-medium text-espresso md:flex">
          {links.map((l) => <a key={l.label} href={l.href} className="relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-terra after:transition-transform hover:after:scale-x-100">{l.label}</a>)}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <button aria-label={`Cart, ${cartCount} items`} onClick={() => openPanel('cart')} className="relative grid size-11 place-items-center rounded-full text-espresso transition hover:bg-sand/50">
            <CartIcon className="size-[22px]" />
            {cartCount > 0 && <span key={cartCount} className="absolute top-1 right-0.5 grid min-w-[18px] animate-bump place-items-center rounded-full bg-terra px-1 text-[10px] font-semibold text-white">{cartCount}</span>}
          </button>
          {/* One login button for customers and staff; admins land in the admin panel after signing in. */}
          <button onClick={account} className="hidden items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-cream transition hover:scale-[1.04] sm:flex">
            {user && <span className="grid size-5 place-items-center rounded-full bg-terra text-[11px] text-white">{user.name[0]}</span>}
            {user ? user.name.split(' ')[0] : 'Log in'}
          </button>
          <button aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="grid size-11 place-items-center rounded-full md:hidden">
            <span className="grid gap-1.5"><span className={`block h-0.5 w-6 bg-espresso transition ${open ? 'translate-y-2 rotate-45' : ''}`} /><span className={`block h-0.5 w-6 bg-espresso transition ${open ? 'opacity-0' : ''}`} /><span className={`block h-0.5 w-6 bg-espresso transition ${open ? '-translate-y-2 -rotate-45' : ''}`} /></span>
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="mx-4 mt-3 grid gap-1 rounded-3xl bg-cream p-4 shadow-xl md:hidden">
          {links.map((l) => <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 font-display text-2xl font-[700] text-espresso hover:bg-sand/40">{l.label}</a>)}
          <button onClick={() => { setOpen(false); account() }} className="mt-2 rounded-full bg-espresso px-4 py-3 text-sm font-semibold text-cream">{user ? user.name.split(' ')[0] : 'Log in'}</button>
        </nav>
      )}
    </header>
  )
}

/** Floating chat button: opens a WhatsApp chat with the café number from the admin panel. */
export function ChatButton() {
  const { site } = useStore()
  const d = site.contact.phone.replace(/\D/g, '')
  const wa = d.startsWith('0') ? `94${d.slice(1)}` : d
  return (
    <a
      href={`https://wa.me/${wa}?text=${encodeURIComponent('Hi Sip & Soul Café! ')}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-5 bottom-5 z-40 grid size-14 place-items-center rounded-full bg-espresso text-cream shadow-[0_14px_40px_rgba(43,29,22,.35)] transition hover:scale-110 hover:bg-terra"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5 5.3 16A8 8 0 1 1 8 18.7L4 19.5Z" strokeLinejoin="round" /><path d="M9 10h6M9 13h4" strokeLinecap="round" /></svg>
    </a>
  )
}
