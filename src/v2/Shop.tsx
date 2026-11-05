import { useEffect, useRef, useState } from 'react'
import type { Category } from '../lib/types'
import { useStore } from '../state/store'

const CARDS = [
  { title: 'Origin', text: 'Where the beans grow shapes how they taste: altitude, soil and rain.', image: 'images/1559525839-b184a4d698c7.jpg', cta: 'Explore', href: '#story' },
  { title: 'Roast', text: 'Light, medium or dark, roasted in small batches every week.', image: 'images/1447933601403-0c6688de566e.jpg', cta: 'Shop now', panel: true },
  { title: 'Beans', text: 'Whole beans to take home, ground to order for your brewer.', image: 'images/1587734195503-904fca47e0e9.jpg', cta: 'Shop now', panel: true },
  { title: 'Flavor', text: 'Chocolate, caramel, citrus or berry. Find the notes you love.', image: 'images/1495474472287-4d71bcdd2085.jpg', cta: 'Explore', href: '#menu' },
]

/** A giant matte mug with coffee dripping into it, drawn in SVG so it stays crisp at any size. */
function GiantMug() {
  return (
    <svg aria-hidden viewBox="0 0 600 520" className="absolute top-[340px] left-1/2 w-[min(620px,110vw)] -translate-x-1/2 opacity-90 md:top-[360px]">
      <defs>
        <linearGradient id="mug" x1="0" x2="1"><stop offset="0" stopColor="#cdb39b" /><stop offset=".45" stopColor="#e4d2c0" /><stop offset="1" stopColor="#c4a78d" /></linearGradient>
        <linearGradient id="drip" y1="0" y2="1"><stop offset="0" stopColor="#5a2f17" /><stop offset="1" stopColor="#2b1609" /></linearGradient>
      </defs>
      <path d="M440 210c70 0 100 40 100 85s-35 90-110 92" fill="none" stroke="#cdb39b" strokeWidth="42" strokeLinecap="round" />
      <path d="M110 150h340l-22 290a40 40 0 0 1-40 36H172a40 40 0 0 1-40-36Z" fill="url(#mug)" />
      <ellipse cx="280" cy="150" rx="170" ry="34" fill="#d9c3ae" />
      <ellipse cx="280" cy="152" rx="150" ry="24" fill="#3b1c0c" />
      {/* the stream and drops falling in */}
      <rect x="273" y="-10" width="14" height="150" rx="7" fill="url(#drip)" className="animate-[drip-stream_2.4s_ease-in-out_infinite]" />
      {[0, 1, 2].map((i) => <circle key={i} cx="280" cy="0" r="8" fill="#3b1c0c" className="animate-[drip-drop_1.6s_ease-in_infinite]" style={{ animationDelay: `${i * 0.53}s` }} />)}
    </svg>
  )
}

export function FindYourCup() {
  const { openPanel } = useStore()
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // Pagination dots follow the swipe/scroll position of the carousel.
  useEffect(() => {
    const el = track.current
    if (!el) return
    const on = () => {
      const card = el.firstElementChild as HTMLElement | null
      if (!card) return
      setActive(Math.min(CARDS.length - 1, Math.round(el.scrollLeft / (card.offsetWidth + 24))))
    }
    el.addEventListener('scroll', on, { passive: true })
    return () => el.removeEventListener('scroll', on)
  }, [])
  const go = (i: number) => {
    const el = track.current, card = el?.children[i] as HTMLElement | undefined
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' })
  }

  return (
    <section id="find" aria-labelledby="find-title" className="relative overflow-hidden bg-cream pt-24 pb-20">
      <GiantMug />
      <div className="relative z-10 mx-auto max-w-7xl px-5 text-center sm:px-8">
        <p data-reveal className="font-display text-6xl leading-none font-[900] text-terra">4.</p>
        <h2 id="find-title" data-reveal className="mt-2 font-display text-[clamp(3rem,9vw,8rem)] leading-[.9] font-[900] tracking-tight">FIND YOUR CUP</h2>
        <p data-reveal className="mx-auto mt-5 max-w-md text-[17px] text-latte">From where it grows to how it tastes, choose the coffee that's made for you.</p>
        <div data-reveal className="mt-7">
          <a href="#menu" className="inline-flex rounded-full bg-espresso px-7 py-4 text-[15px] font-semibold text-cream shadow-[0_14px_30px_rgba(43,29,22,.25)] transition hover:scale-[1.04]">Discover more</a>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-[min(20rem,64vw)] max-w-7xl px-5 sm:px-8">
        <div
          ref={track}
          role="region"
          aria-roledescription="carousel"
          aria-label="Ways to find your coffee"
          tabIndex={0}
          className="-mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pt-4 pb-8 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0"
        >
          {CARDS.map((c, i) => (
            <article
              key={c.title}
              data-reveal={i * 0.08}
              className="group w-[78vw] max-w-[300px] shrink-0 snap-center rounded-3xl bg-sand/70 p-4 shadow-[0_18px_40px_rgba(43,29,22,.08)] backdrop-blur transition duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(43,29,22,.16)] lg:w-auto lg:max-w-none"
              style={{ marginTop: i % 2 ? 24 : 0 }}
            >
              <div className="aspect-[4/3] overflow-hidden rounded-2xl"><img src={c.image} alt={`${c.title}: coffee`} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" /></div>
              <div className="px-2 pt-4 pb-2">
                <h3 className="font-display text-2xl font-[800]">{c.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-latte">{c.text}</p>
                {c.panel
                  ? <button onClick={() => openPanel('menu')} className="mt-4 rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-cream transition hover:scale-105">{c.cta}</button>
                  : <a href={c.href} className="mt-4 inline-block rounded-full border border-espresso px-5 py-2.5 text-sm font-semibold transition hover:scale-105 hover:bg-espresso hover:text-cream">{c.cta}</a>}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-2 lg:hidden">
          {CARDS.map((c, i) => <button key={c.title} aria-label={`Show ${c.title}`} aria-current={i === active} onClick={() => go(i)} className={`h-2 rounded-full transition-all ${i === active ? 'w-7 bg-espresso' : 'w-2 bg-espresso/25'}`} />)}
        </div>
      </div>
    </section>
  )
}

const FILTERS: { id: 'all' | Category; label: string }[] = [{ id: 'all', label: 'All' }, { id: 'hot', label: 'Hot' }, { id: 'cold', label: 'Cold' }, { id: 'beans', label: 'Beans' }]

export function MenuSection() {
  const { menu, money, addToCart, openPanel, cartCount } = useStore()
  const [filter, setFilter] = useState<'all' | Category>('all')
  const [added, setAdded] = useState<string | null>(null)
  const items = menu.filter((m) => filter === 'all' || m.category === filter)

  return (
    <section id="menu" aria-labelledby="menu-title" className="bg-cream-2/60 py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p data-reveal className="text-sm font-semibold tracking-[.3em] text-terra">THE MENU</p>
            <h2 id="menu-title" data-reveal className="mt-2 font-display text-5xl font-[900] tracking-tight md:text-6xl">Made to order</h2>
          </div>
          <div role="tablist" aria-label="Filter the menu" className="flex gap-1 rounded-full bg-sand/60 p-1">
            {FILTERS.map((f) => (
              <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${filter === f.id ? 'bg-espresso text-cream' : 'text-espresso hover:bg-cream/70'}`}>{f.label}</button>
            ))}
          </div>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((m) => (
            <li key={m.id} className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_rgba(43,29,22,.06)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_26px_50px_rgba(43,29,22,.14)]">
              <div className="aspect-square overflow-hidden"><img src={m.image} alt={m.name} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" /></div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl font-[800]">{m.name}</h3>
                  <span className="shrink-0 font-semibold text-terra">{money(m.price)}</span>
                </div>
                <p className="mt-1 flex-1 text-sm text-latte">{m.description}</p>
                <button
                  onClick={() => { addToCart(m); setAdded(m.id); setTimeout(() => setAdded((a) => (a === m.id ? null : a)), 1200) }}
                  className={`mt-4 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:scale-[1.03] ${added === m.id ? 'bg-terra text-white' : 'bg-espresso text-cream'}`}
                >
                  {added === m.id ? 'Added ✓' : 'Add to order'}
                </button>
              </div>
            </li>
          ))}
          {!items.length && <li className="col-span-full py-10 text-center text-latte">Nothing here yet. Check back soon.</li>}
        </ul>
        {cartCount > 0 && (
          <div className="mt-8 text-center"><button onClick={() => openPanel('cart')} className="rounded-full bg-terra px-7 py-4 font-semibold text-white shadow-lg transition hover:scale-[1.04]">View order ({cartCount}) & check out →</button></div>
        )}
      </div>
    </section>
  )
}
