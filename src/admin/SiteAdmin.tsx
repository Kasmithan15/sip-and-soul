import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Alert, Field, Submit, TextArea } from '../components/shop/ui'
import { api, ApiError } from '../lib/api'
import type { SiteContent } from '../lib/types'
import { EMAIL, PHONE } from '../lib/validate'
import { useStore } from '../state/store'

const ICONS = [['bean', 'Coffee bean'], ['leaf', 'Leaf'], ['truck', 'Delivery truck'], ['shield', 'Shield']] as const

// Same limits as the server, keyed by the same paths it reports errors under.
function validate(s: SiteContent) {
  const e: Record<string, string> = {}
  const len = (path: string, v: string, min: number, max: number, label: string) => {
    const t = v.trim()
    if (t.length < min || t.length > max) e[path] = min > 0 && !t ? `${label} can't be empty.` : `${label} must be ${min} to ${max} characters.`
  }
  len('currency', s.currency, 1, 4, 'Currency symbol')
  len('hero.eyebrow', s.hero.eyebrow, 1, 80, 'Small heading')
  len('hero.titleLine1', s.hero.titleLine1, 1, 40, 'Title line 1')
  len('hero.titleLine2', s.hero.titleLine2, 1, 40, 'Title line 2')
  len('hero.text', s.hero.text, 10, 300, 'Text')
  s.features.forEach((f, i) => { len(`features.${i}.title`, f.title, 1, 40, 'Title'); len(`features.${i}.text`, f.text, 1, 120, 'Text') })
  len('menu.eyebrow', s.menu.eyebrow, 1, 60, 'Small heading'); len('menu.title', s.menu.title, 1, 60, 'Title'); len('menu.text', s.menu.text, 1, 400, 'Text')
  len('story.eyebrow', s.story.eyebrow, 1, 60, 'Small heading'); len('story.title', s.story.title, 1, 60, 'Title'); len('story.text', s.story.text, 1, 400, 'Text'); len('story.tagline', s.story.tagline, 1, 60, 'Tagline')
  s.stats.forEach((st, i) => {
    if (!Number.isFinite(st.value) || st.value < 0 || st.value > 1_000_000) e[`stats.${i}.value`] = 'Enter a number from 0 to 1,000,000.'
    if (st.suffix.length > 4) e[`stats.${i}.suffix`] = '4 characters or fewer.'
    len(`stats.${i}.label`, st.label, 1, 40, 'Label')
  })
  len('cta.eyebrow', s.cta.eyebrow, 1, 80, 'Small heading'); len('cta.title', s.cta.title, 1, 60, 'Title')
  len('visit.eyebrow', s.visit.eyebrow, 1, 40, 'Small heading'); len('visit.title', s.visit.title, 1, 60, 'Title')
  if (!PHONE.test(s.contact.phone.trim())) e['contact.phone'] = 'Enter a valid phone number, for example 077 123 4567.'
  if (!EMAIL.test(s.contact.email.trim())) e['contact.email'] = 'Enter a valid email address.'
  if (s.contact.address.length > 160) e['contact.address'] = 'Address must be 160 characters or fewer.'
  if (s.contact.hours.length > 120) e['contact.hours'] = 'Opening hours must be 120 characters or fewer.'
  s.reviews.forEach((r, i) => { len(`reviews.${i}.name`, r.name, 1, 40, 'Name'); len(`reviews.${i}.text`, r.text, 5, 280, 'Review') })
  return e
}

function Card({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white shadow-[0_12px_32px_rgba(43,29,22,.07)] p-6">
      <h2 className="font-display text-2xl font-[800] tracking-tight text-espresso">{title}</h2>
      {note && <p className="mt-1 text-sm text-latte">{note}</p>}
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  )
}

export function SiteAdmin() {
  const { reloadContent } = useStore()
  const [saved, setSaved] = useState<SiteContent | null>(null)
  const [s, setS] = useState<SiteContent | null>(null)
  const [touched, setTouched] = useState(false)
  const [server, setServer] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { api<SiteContent>('/site').then((x) => { setSaved(x); setS(x) }).catch((e: ApiError) => setMsg({ tone: 'error', text: e.message })) }, [])

  if (!s) return <p className="text-latte">{msg?.text ?? 'Loading website text…'}</p>

  const errors = validate(s)
  const err = (path: string) => (touched ? errors[path] : '') || server[path]
  const dirty = JSON.stringify(s) !== JSON.stringify(saved)
  // Small helper to update one nested value immutably.
  const up = (fn: (draft: SiteContent) => void) => setS((cur) => { const next = structuredClone(cur!); fn(next); return next })
  const field = (label: string, path: string, value: string, onChange: (v: string) => void, max: number, area = false) =>
    area
      ? <TextArea key={path} label={label} rows={3} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} error={err(path)} hint={`${value.length}/${max}`} />
      : <Field key={path} label={label} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} error={err(path)} />

  async function save(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    setMsg(null)
    if (Object.keys(errors).length) return setMsg({ tone: 'error', text: 'Some fields need fixing. They are marked in red below.' })
    setBusy(true)
    try {
      const result = await api<SiteContent>('/admin/site', { method: 'PUT', json: s })
      setSaved(result); setS(result); setServer({}); setTouched(false)
      setMsg({ tone: 'success', text: 'Saved. The website now shows your changes.' })
      void reloadContent()
    } catch (er) {
      setServer((er as ApiError).fields)
      setMsg({ tone: 'error', text: (er as ApiError).message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form noValidate onSubmit={save} className="grid max-w-4xl gap-6">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}

      <Card title="Contact details" note="Phone and email, shown in Visit us and the footer.">
        <div className="grid gap-4 sm:grid-cols-2">
          {field('Phone', 'contact.phone', s.contact.phone, (v) => up((d) => { d.contact.phone = v }), 22)}
          {field('Email', 'contact.email', s.contact.email, (v) => up((d) => { d.contact.email = v }), 254)}
        </div>
        <div className="max-w-[160px]">{field('Currency symbol', 'currency', s.currency, (v) => up((d) => { d.currency = v }), 4)}</div>
      </Card>

      <Card title="Visit us section" note="The “Visit us” part of the homepage, with the map. The address and hours also show in the footer.">
        <div className="grid gap-4 sm:grid-cols-2">
          {field('Small heading', 'visit.eyebrow', s.visit.eyebrow, (v) => up((d) => { d.visit.eyebrow = v }), 40)}
          {field('Title', 'visit.title', s.visit.title, (v) => up((d) => { d.visit.title = v }), 60)}
        </div>
        {field('Café address (shows the map and “Get directions”)', 'contact.address', s.contact.address, (v) => up((d) => { d.contact.address = v }), 160)}
        {field('Opening hours', 'contact.hours', s.contact.hours, (v) => up((d) => { d.contact.hours = v }), 120)}
        <p className="-mt-2 text-xs text-latte">Example: Mon–Fri 7:00–20:00 · Sat–Sun 8:00–22:00</p>
      </Card>

      <Card title="Top of the page (hero)">
        {field('Small heading', 'hero.eyebrow', s.hero.eyebrow, (v) => up((d) => { d.hero.eyebrow = v }), 80)}
        <div className="grid gap-4 sm:grid-cols-2">
          {field('Title line 1', 'hero.titleLine1', s.hero.titleLine1, (v) => up((d) => { d.hero.titleLine1 = v }), 40)}
          {field('Title line 2', 'hero.titleLine2', s.hero.titleLine2, (v) => up((d) => { d.hero.titleLine2 = v }), 40)}
        </div>
        {field('Text', 'hero.text', s.hero.text, (v) => up((d) => { d.hero.text = v }), 300, true)}
      </Card>

      <Card title="Four promises" note="The row of icons under the top section.">
        <div className="grid gap-5 sm:grid-cols-2">
          {s.features.map((f, i) => (
            <div key={i} className="grid gap-3 rounded-xl bg-cream p-4">
              <label className="block text-[13px] font-medium text-roast">Icon
                <select value={f.icon} onChange={(e) => up((d) => { d.features[i].icon = e.target.value as typeof f.icon })} className="mt-1.5 block w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px]">
                  {ICONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
              {field('Title', `features.${i}.title`, f.title, (v) => up((d) => { d.features[i].title = v }), 40)}
              {field('Text', `features.${i}.text`, f.text, (v) => up((d) => { d.features[i].text = v }), 120)}
            </div>
          ))}
        </div>
      </Card>

      <Card title="Coffee favorites section">
        {field('Small heading', 'menu.eyebrow', s.menu.eyebrow, (v) => up((d) => { d.menu.eyebrow = v }), 60)}
        {field('Title', 'menu.title', s.menu.title, (v) => up((d) => { d.menu.title = v }), 60)}
        {field('Text', 'menu.text', s.menu.text, (v) => up((d) => { d.menu.text = v }), 400, true)}
      </Card>

      <Card title="Our story">
        {field('Small heading', 'story.eyebrow', s.story.eyebrow, (v) => up((d) => { d.story.eyebrow = v }), 60)}
        {field('Title', 'story.title', s.story.title, (v) => up((d) => { d.story.title = v }), 60)}
        {field('Text', 'story.text', s.story.text, (v) => up((d) => { d.story.text = v }), 400, true)}
        {field('Tagline (script text)', 'story.tagline', s.story.tagline, (v) => up((d) => { d.story.tagline = v }), 60)}
      </Card>

      <Card title="Numbers" note="The four counters. For example 10 + “K+” shows as 10K+.">
        <div className="grid gap-4 sm:grid-cols-2">
          {s.stats.map((st, i) => (
            <div key={i} className="grid grid-cols-[1fr_80px_90px] gap-3 rounded-xl bg-cream p-4">
              <div className="col-span-3">{field('Label', `stats.${i}.label`, st.label, (v) => up((d) => { d.stats[i].label = v }), 40)}</div>
              <Field label="Number" inputMode="decimal" value={String(st.value)} onChange={(e) => up((d) => { d.stats[i].value = e.target.value === '' ? NaN : Number(e.target.value) })} error={err(`stats.${i}.value`)} />
              <Field label="After" value={st.suffix} maxLength={4} onChange={(e) => up((d) => { d.stats[i].suffix = e.target.value })} error={err(`stats.${i}.suffix`)} />
              <label className="block text-[13px] font-medium text-roast">Decimals
                <select value={st.decimals} onChange={(e) => up((d) => { d.stats[i].decimals = Number(e.target.value) })} className="mt-1.5 block w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px]">
                  {[0, 1, 2].map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Order banner">
        {field('Small heading', 'cta.eyebrow', s.cta.eyebrow, (v) => up((d) => { d.cta.eyebrow = v }), 80)}
        {field('Title', 'cta.title', s.cta.title, (v) => up((d) => { d.cta.title = v }), 60)}
      </Card>

      <Card title="Guest reviews" note="Copy real reviews from your customers (for example from Google). The section is hidden on the website until you add one.">
        {s.reviews.map((r, i) => (
          <div key={i} className="grid gap-3 rounded-xl bg-cream p-4 sm:grid-cols-[1fr_120px_auto] sm:items-start">
            {field('Name', `reviews.${i}.name`, r.name, (v) => up((d) => { d.reviews[i].name = v }), 40)}
            <label className="block text-[13px] font-medium text-roast">Stars
              <select value={r.rating} onChange={(e) => up((d) => { d.reviews[i].rating = Number(e.target.value) })} className="mt-1.5 block w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px]">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => up((d) => { d.reviews.splice(i, 1) })} className="self-end rounded-full px-3 py-2.5 text-sm text-[#b4442f] hover:bg-[#fbeeea]">Remove</button>
            <div className="sm:col-span-3">{field('Review', `reviews.${i}.text`, r.text, (v) => up((d) => { d.reviews[i].text = v }), 280, true)}</div>
          </div>
        ))}
        {s.reviews.length < 6 && (
          <button type="button" onClick={() => up((d) => { d.reviews.push({ name: '', text: '', rating: 5 }) })} className="justify-self-start rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-roast hover:border-mocha">+ Add a review</button>
        )}
      </Card>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-full bg-espresso/95 py-3 pr-3 pl-6 text-cream shadow-[0_18px_40px_rgba(43,29,22,.3)] backdrop-blur">
        <span className="mr-auto text-sm text-cream/75">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</span>
        <button type="button" disabled={!dirty || busy} onClick={() => { setS(saved); setTouched(false); setServer({}); setMsg(null) }} className="rounded-full px-5 py-2.5 text-sm text-cream/75 hover:text-cream disabled:opacity-40">Undo changes</button>
        <div className="w-44"><Submit busy={busy} className="!bg-terra hover:!bg-terra-dark">Save changes</Submit></div>
      </div>
    </form>
  )
}
