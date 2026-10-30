import { useEffect, useRef, useState } from 'react'
import { navLinks } from '../data/content'
import { CartIcon, SearchIcon, UserIcon } from './Icons'
import { Logo } from './Logo'

export function Header({ cartCount }: { cartCount: number }) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastY = useRef(0)

  // Shrink after a small scroll; hide while scrolling down, reappear when scrolling up.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 60)
      setHidden(y > lastY.current && y > 400)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 text-cream transition-all duration-500 ease-smooth sm:px-[7%]
        ${scrolled && !menuOpen ? 'bg-espresso/85 py-3.5 shadow-[0_4px_30px_rgba(0,0,0,.2)] backdrop-blur-md' : 'py-6'}
        ${hidden && !menuOpen ? '-translate-y-full' : ''}`}
    >
      <Logo />

      <nav
        className={`fixed inset-0 -z-10 flex flex-col items-center justify-center gap-8 bg-espresso transition-[clip-path] duration-700 ease-smooth
          md:static md:z-auto md:flex-row md:gap-10 md:bg-transparent md:[clip-path:none]
          ${menuOpen ? '[clip-path:circle(150%_at_calc(100%-40px)_40px)]' : '[clip-path:circle(0_at_calc(100%-40px)_40px)]'}`}
      >
        {navLinks.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={`relative py-1.5 font-serif text-2xl transition-opacity duration-300 hover:opacity-100 md:font-sans md:text-sm
              after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:w-full after:origin-right after:scale-x-0 after:bg-gold
              after:transition-transform after:duration-500 after:ease-smooth hover:after:origin-left hover:after:scale-x-100
              ${i === 0 ? 'opacity-100 after:scale-x-100' : 'opacity-85'}`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-4 sm:gap-6">
        {[SearchIcon, UserIcon].map((Icon, i) => (
          <button key={i} aria-label={i ? 'Account' : 'Search'} className="transition hover:-translate-y-0.5 hover:text-gold">
            <Icon className="size-[22px]" />
          </button>
        ))}
        <button aria-label="Cart" className="relative transition hover:-translate-y-0.5 hover:text-gold">
          <CartIcon className="size-[22px]" />
          <span
            // Remounting on each change replays the bump animation.
            key={cartCount}
            className={`absolute -top-2 -right-2.5 grid size-[17px] place-items-center rounded-full bg-cream text-[10px] font-semibold text-roast
              ${cartCount ? 'animate-bump' : ''}`}
          >
            {cartCount}
          </span>
        </button>
        <button
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex flex-col gap-[5px] md:hidden"
        >
          <span className={`h-[1.5px] w-[22px] bg-current transition ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
          <span className={`h-[1.5px] w-[22px] bg-current transition ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`h-[1.5px] w-[22px] bg-current transition ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
        </button>
      </div>
    </header>
  )
}
