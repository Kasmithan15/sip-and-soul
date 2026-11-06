import { useState, type FormEvent } from 'react'
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, YoutubeIcon } from '../components/Icons'
import { Alert, Field, Submit, TextArea } from '../components/shop/ui'
import { company } from '../data/content'
import { api, ApiError } from '../lib/api'
import { hasErrors, rules } from '../lib/validate'
import { useStore } from '../state/store'
import { Logo } from './Nav'

const RECIPES = [
  { name: 'Pour-over', ratio: '15 g coffee · 250 ml water', time: '3 min', grind: 'Medium-fine', steps: ['Rinse the paper filter with hot water.', 'Add coffee and pour 40 ml to bloom for 30 s.', 'Pour the rest slowly in circles.', 'Let it drain, swirl and serve.'] },
  { name: 'French press', ratio: '30 g coffee · 500 ml water', time: '4 min', grind: 'Coarse', steps: ['Warm the press and add the coffee.', 'Pour water just off the boil and stir.', 'Put the lid on and wait 4 minutes.', 'Press slowly and pour straight away.'] },
  { name: 'Cold brew', ratio: '100 g coffee · 1 L cold water', time: '18 hours', grind: 'Extra coarse', steps: ['Stir coffee into cold water in a jar.', 'Cover and leave in the fridge 18 hours.', 'Strain through a paper filter.', 'Serve over ice, with milk if you like.'] },
]

export function Recipes() {
  return (
    <section id="recipes" aria-labelledby="recipes-title" className="bg-cream py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p data-reveal className="text-sm font-semibold tracking-[.3em] text-terra">RECIPES</p>
        <h2 id="recipes-title" data-reveal className="mt-2 max-w-2xl font-display text-5xl leading-[.95] font-[900] tracking-tight md:text-6xl">Slow brews for slow mornings</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {RECIPES.map((r, i) => (
            <article key={r.name} data-reveal={i * 0.1} className="rounded-3xl bg-sand/60 p-7 transition duration-500 hover:-translate-y-2 hover:shadow-[0_26px_50px_rgba(43,29,22,.12)]">
              <h3 className="font-display text-3xl font-[800]">{r.name}</h3>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                {[['Ratio', r.ratio], ['Time', r.time], ['Grind', r.grind]].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-cream/70 p-2.5"><dt className="text-latte">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>
                ))}
              </dl>
              <ol className="mt-5 grid gap-2.5 text-[15px]">
                {r.steps.map((s, n) => <li key={n} className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-espresso text-xs font-semibold text-cream">{n + 1}</span>{s}</li>)}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function OurStory() {
  const { story } = useStore().site
  const parts = [
    { title: 'The roastery', text: 'Small batches roasted every week, so the beans in your cup are never more than a few days from the roaster.', image: 'images/1453614512568-c4024d13c247.jpg' },
    { title: 'The beans', text: 'Carefully chosen beans, picked for sweetness and balance, and traced back to where they were grown.', image: 'images/1497935586351-b67a49e012bf.jpg' },
    { title: 'The baristas', text: 'A small team who know your name and your order, and love talking about coffee.', image: 'images/1554118811-1e0d58224f24.jpg' },
  ]
  return (
    <section id="story" aria-labelledby="story-title" className="bg-espresso py-24 text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p data-reveal className="text-sm font-semibold tracking-[.3em] text-gold">{story.eyebrow}</p>
          <h2 id="story-title" data-reveal className="mt-2 font-display text-5xl leading-[.95] font-[900] tracking-tight md:text-6xl">{story.title}</h2>
          <p data-reveal className="mt-6 text-[17px] leading-relaxed text-cream/75">{story.text}</p>
          <p data-reveal className="mt-6 font-display text-2xl text-gold italic">“{story.tagline}”</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {parts.map((p, i) => (
            <article key={p.title} data-reveal={i * 0.1} className="group overflow-hidden rounded-3xl bg-white/5">
              <div className="aspect-[3/4] overflow-hidden"><img src={p.image} alt={p.title} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" /></div>
              <div className="p-5"><h3 className="font-display text-xl font-[800]">{p.title}</h3><p className="mt-1.5 text-sm leading-relaxed text-cream/70">{p.text}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function VisitUs() {
  const { contact, visit } = useStore().site
  const tel = `tel:${contact.phone.replace(/[^\d+]/g, '')}`
  const q = encodeURIComponent(contact.address)
  return (
    <section id="visit" aria-labelledby="visit-title" className="bg-cream py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p data-reveal className="text-sm font-semibold tracking-[.3em] text-terra uppercase">{visit.eyebrow}</p>
          <h2 id="visit-title" data-reveal className="mt-2 font-display text-5xl font-[900] tracking-tight md:text-6xl">{visit.title}</h2>
          <dl data-reveal className="mt-8 grid gap-5 text-[16px]">
            <div><dt className="text-sm text-latte">Address</dt><dd className="mt-1 font-semibold">{contact.address || 'Address coming soon'}</dd></div>
            <div><dt className="text-sm text-latte">Opening hours</dt><dd className="mt-1 font-semibold">{contact.hours || 'Call us for today’s opening hours'}</dd></div>
            <div><dt className="text-sm text-latte">Contact</dt><dd className="mt-1 grid font-semibold"><a href={tel} className="py-2 hover:text-terra">{contact.phone}</a><a href={`mailto:${contact.email}`} className="py-2 hover:text-terra">{contact.email}</a></dd></div>
          </dl>
          <div data-reveal className="mt-8 flex flex-wrap gap-3">
            {contact.address && <a href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-espresso px-6 py-3.5 text-sm font-semibold text-cream transition hover:scale-[1.04]">Get directions →</a>}
            <a href={tel} className="rounded-full border border-espresso px-6 py-3.5 text-sm font-semibold transition hover:scale-[1.04] hover:bg-espresso hover:text-cream">Call us</a>
          </div>
        </div>
        <div data-reveal className="min-h-[360px] overflow-hidden rounded-3xl bg-sand/50 shadow-[0_20px_50px_rgba(43,29,22,.1)]">
          {contact.address ? (
            <iframe title={`Map showing ${contact.address}`} src={`https://www.google.com/maps?q=${q}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="size-full min-h-[360px] border-0 grayscale-[30%] sepia-[15%]" />
          ) : (
            <div className="grid size-full min-h-[360px] place-items-center p-8 text-center text-latte">
              <div><p className="font-display text-2xl font-[800] text-espresso">Map coming soon</p><p className="mt-2 text-sm">The map appears here once the café address is added in the admin panel.</p></div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

const GALLERY = ['1600093463592-8e36ae95ef56', '1509042239860-f550ce710b93', '1521017432531-fbd92d768814', '1442512595331-e89e73853f31', '1445116572660-236099ec97a0', '1517701604599-bb29b565090c']

export function ReviewsGallery() {
  const { reviews } = useStore().site
  return (
    <section aria-labelledby="gallery-title" className="bg-cream-2/60 py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {reviews.length > 0 && (
          <>
            <p data-reveal className="text-sm font-semibold tracking-[.3em] text-terra">REVIEWS</p>
            <h2 data-reveal className="mt-2 font-display text-5xl font-[900] tracking-tight">What our guests say</h2>
            <ul className="mt-10 mb-20 grid gap-6 md:grid-cols-3">
              {reviews.map((r, i) => (
                <li key={i} data-reveal={i * 0.08} className="rounded-3xl bg-white p-7 shadow-[0_10px_30px_rgba(43,29,22,.06)]">
                  <p aria-label={`${r.rating} out of 5 stars`} className="text-lg tracking-widest text-terra">{'★'.repeat(r.rating)}<span className="text-sand">{'★'.repeat(5 - r.rating)}</span></p>
                  <blockquote className="mt-3 text-[16px] leading-relaxed">“{r.text}”</blockquote>
                  <p className="mt-4 text-sm font-semibold text-latte">— {r.name}</p>
                </li>
              ))}
            </ul>
          </>
        )}
        <p data-reveal className="text-sm font-semibold tracking-[.3em] text-terra">#SIPANDSOUL</p>
        <h2 id="gallery-title" data-reveal className="mt-2 font-display text-5xl font-[900] tracking-tight">Moments at the café</h2>
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {GALLERY.map((id, i) => (
            <li key={id} data-reveal={(i % 3) * 0.08} className={`group overflow-hidden rounded-3xl ${i === 0 ? 'row-span-2' : ''}`}>
              <img src={`images/${id}.jpg`} alt="Coffee and the café space" loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** "YYYY-MM-DD" for today + n days in local time. */
const day = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('en-CA') }
const TIMES = Array.from({ length: 31 }, (_, i) => `${String(7 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)

export function OrderReserve() {
  const { user, openPanel } = useStore()
  const [f, setF] = useState({ name: user?.name ?? '', phone: user?.phone ?? '', email: user?.email ?? '', date: day(0), time: '18:00', guests: 2, note: '' })
  const [touched, setTouched] = useState(false)
  const [server, setServer] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<null | { date: string; time: string; guests: number }>(null)
  const errors = {
    name: rules.name(f.name), phone: rules.phone(f.phone), email: rules.email(f.email),
    date: !f.date ? 'Choose a date.' : f.date < day(0) ? 'Choose today or a later date.' : f.date > day(60) ? 'Reservations open up to 60 days ahead.' : '',
    time: f.date === day(0) && f.time <= new Date().toTimeString().slice(0, 5) ? 'Choose a later time today.' : '',
    note: f.note.length > 300 ? 'Note must be 300 characters or fewer.' : '',
  }
  const show = (k: keyof typeof errors) => (touched ? errors[k] : '') || server[k]
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setF((x) => ({ ...x, [k]: k === 'guests' ? Number(e.target.value) : e.target.value })); setServer((s) => ({ ...s, [k]: '' })) }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    setMsg('')
    if (hasErrors(errors)) return
    setBusy(true)
    try {
      setDone(await api('/reservations', { method: 'POST', json: { ...f, note: f.note || undefined } }))
    } catch (err) {
      setServer((err as ApiError).fields)
      setMsg((err as ApiError).status === 429 ? 'Too many requests. Please wait a minute.' : (err as ApiError).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="reserve" aria-labelledby="reserve-title" className="bg-cream py-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_1.3fr]">
        <div data-reveal className="flex flex-col justify-between rounded-[2rem] bg-terra p-9 text-white">
          <div>
            <p className="text-sm font-semibold tracking-[.3em] text-white/70">ORDER ONLINE</p>
            <h2 className="mt-2 font-display text-5xl leading-[.95] font-[900] tracking-tight">Skip the queue</h2>
            <p className="mt-4 max-w-sm text-white/85">Order ahead for pickup or delivery. We'll have it ready when you arrive.</p>
          </div>
          <button onClick={() => openPanel('menu')} className="mt-10 self-start rounded-full bg-espresso px-7 py-4 font-semibold text-cream transition hover:scale-[1.04]">Start your order →</button>
        </div>
        <div data-reveal className="rounded-[2rem] bg-white p-7 shadow-[0_20px_50px_rgba(43,29,22,.08)] sm:p-9">
          <h2 id="reserve-title" className="font-display text-4xl font-[900] tracking-tight">Reserve a table</h2>
          {done ? (
            <div className="mt-6">
              <Alert tone="success">Thank you! We've received your request for <b>{done.guests} {done.guests === 1 ? 'guest' : 'guests'}</b> on <b>{new Date(done.date + 'T00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</b> at <b>{done.time}</b>. We'll call or message you to confirm.</Alert>
              <button onClick={() => { setDone(null); setTouched(false) }} className="text-sm font-semibold text-terra hover:underline">Make another reservation</button>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
              {msg && <div className="sm:col-span-2"><Alert>{msg}</Alert></div>}
              <Field label="Name" autoComplete="name" value={f.name} onChange={set('name')} error={show('name')} />
              <Field label="Phone" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} error={show('phone')} placeholder="077 123 4567" />
              <Field label="Email" type="email" autoComplete="email" value={f.email} onChange={set('email')} error={show('email')} className="sm:col-span-2" />
              <Field label="Date" type="date" min={day(0)} max={day(60)} value={f.date} onChange={set('date')} error={show('date')} />
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-[13px] font-medium text-roast">Time
                  <select value={f.time} onChange={set('time')} aria-invalid={!!show('time')} className={`mt-1.5 block w-full rounded-lg border bg-white px-3 py-2.5 text-[15px] ${show('time') ? 'border-[#b4442f]' : 'border-line'}`}>{TIMES.map((t) => <option key={t}>{t}</option>)}</select>
                  {show('time') && <span className="mt-1 block text-xs text-[#b4442f]">{show('time')}</span>}
                </label>
                <label className="block text-[13px] font-medium text-roast">Guests
                  <select value={f.guests} onChange={set('guests')} className="mt-1.5 block w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px]">{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select>
                </label>
              </div>
              <div className="sm:col-span-2"><TextArea label="Anything we should know? (optional)" rows={2} maxLength={300} value={f.note} onChange={set('note')} error={show('note')} placeholder="Window seat, birthday, high chair…" /></div>
              <div className="sm:col-span-2"><Submit busy={busy}>Request reservation</Submit></div>
              <p className="text-xs text-latte sm:col-span-2">For more than 12 guests, please call us.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  const { contact } = useStore().site
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')
  const [error, setError] = useState('')
  const tel = `tel:${contact.phone.replace(/[^\d+]/g, '')}`
  const year = new Date().getFullYear()

  async function subscribe(e: FormEvent) {
    e.preventDefault()
    const err = rules.email(email)
    setError(err)
    if (err) return
    setState('busy')
    try {
      await api('/newsletter', { method: 'POST', json: { email } })
      setState('done')
    } catch (x) {
      setError((x as ApiError).message)
      setState('idle')
    }
  }

  return (
    <footer id="contact" className="bg-espresso px-5 pt-20 pb-8 text-cream sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-cream/65">Freshly ground, slowly poured. Specialty coffee from bean to cup.</p>
          <form noValidate onSubmit={subscribe} className="mt-7 max-w-sm">
            <label htmlFor="newsletter" className="text-sm font-semibold">Get new blends and offers by email</label>
            {state === 'done' ? (
              <p role="status" className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-sm">You're on the list. Thank you!</p>
            ) : (
              <div className="mt-3 flex gap-2">
                <input id="newsletter" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} aria-invalid={!!error} aria-describedby="newsletter-msg" placeholder="you@example.com" className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-cream outline-none placeholder:text-cream/40 focus:border-gold" />
                <button disabled={state === 'busy'} className="rounded-full bg-terra px-5 py-3 text-sm font-semibold text-white transition hover:scale-105 disabled:opacity-60">Subscribe</button>
              </div>
            )}
            <p id="newsletter-msg" className="mt-2 min-h-4 text-xs text-[#f2a58a]">{error}</p>
          </form>
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-[.2em] text-gold">VISIT</h3>
          <p className="mt-4 text-cream/75">{contact.address || 'Address coming soon'}</p>
          <p className="mt-2 text-cream/75">{contact.hours || 'Call us for opening hours'}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-[.2em] text-gold">CONTACT</h3>
          <a href={tel} className="mt-3 flex items-center gap-2 py-2 text-cream/85 hover:text-gold"><PhoneIcon className="size-4" />{contact.phone}</a>
          <a href={`mailto:${contact.email}`} className="flex items-center gap-2 py-2 text-cream/85 hover:text-gold"><MailIcon className="size-4" />{contact.email}</a>
          <div className="mt-6 flex gap-3">
            {[['Instagram', InstagramIcon], ['Facebook', FacebookIcon], ['YouTube', YoutubeIcon]].map(([label, Icon]) => {
              const I = Icon as typeof InstagramIcon
              return <a key={label as string} href="#" aria-label={label as string} className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:scale-110 hover:bg-terra"><I className="size-[18px]" /></a>
            })}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
        <p className="text-cream/55">© {year} Sip &amp; Soul Café. All rights reserved.</p>
        <p className="flex items-center gap-2 text-cream/70">
          Designed &amp; developed by
          <a href={company.website} target="_blank" rel="noopener noreferrer" aria-label={`${company.name} website`} className="flex min-h-9 items-center gap-1.5 rounded-full bg-white px-3 py-2 transition hover:-translate-y-0.5">
            <img src="images/neirah-icon.png" alt="" className="h-4 w-auto" /><img src="images/neirah-wordmark.png" alt={company.name} className="h-2.5 w-auto" />
          </a>
        </p>
      </div>
    </footer>
  )
}
