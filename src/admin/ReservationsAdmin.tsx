import { useEffect, useState } from 'react'
import { api, ApiError } from '../lib/api'

interface Reservation { id: string; name: string; phone: string; email: string; date: string; time: string; guests: number; note: string; status: 'requested' | 'confirmed' | 'declined' | 'cancelled'; createdAt: string }
interface Subscriber { id: string; email: string; createdAt: string }

const STYLE: Record<Reservation['status'], string> = {
  requested: 'bg-[#f4e7d3] text-[#7a5520]', confirmed: 'bg-[#dcefe0] text-[#2d6a3a]', declined: 'bg-[#f6e1dc] text-[#8f3424]', cancelled: 'bg-cream-2 text-latte',
}
const today = () => new Date().toLocaleDateString('en-CA')
const waNumber = (p: string) => { const d = p.replace(/\D/g, ''); return d.startsWith('0') ? `94${d.slice(1)}` : d }

export function ReservationsAdmin() {
  const [list, setList] = useState<Reservation[] | null>(null)
  const [subs, setSubs] = useState<Subscriber[]>([])
  const [show, setShow] = useState<'upcoming' | 'past'>('upcoming')
  const [error, setError] = useState('')

  const load = () => Promise.all([api<Reservation[]>('/admin/reservations').then(setList), api<Subscriber[]>('/admin/subscribers').then(setSubs)]).catch((e: ApiError) => setError(e.message))
  useEffect(() => { void load(); const id = setInterval(load, 30_000); return () => clearInterval(id) }, [])

  async function setStatus(r: Reservation, status: Reservation['status']) {
    try {
      const u = await api<Reservation>(`/admin/reservations/${r.id}`, { method: 'PATCH', json: { status } })
      setList((l) => l?.map((x) => (x.id === r.id ? u : x)) ?? null)
    } catch (e) { setError((e as ApiError).message) }
  }
  async function removeSub(s: Subscriber) {
    if (!confirm(`Remove ${s.email} from the newsletter?`)) return
    await api(`/admin/subscribers/${s.id}`, { method: 'DELETE' }).catch((e: ApiError) => setError(e.message))
    void load()
  }

  const shown = (list ?? []).filter((r) => (show === 'upcoming' ? r.date >= today() : r.date < today())).sort((a, b) => (show === 'upcoming' ? 1 : -1) * (a.date + a.time).localeCompare(b.date + b.time))

  return (
    <div className="grid gap-8">
      {error && <p role="alert" className="text-[#b4442f]">{error}</p>}
      <section className="grid gap-4">
        <div className="flex gap-2">
          {(['upcoming', 'past'] as const).map((t) => <button key={t} onClick={() => setShow(t)} className={`rounded-full px-4 py-2 text-sm capitalize ${show === t ? 'bg-espresso text-cream' : 'bg-white hover:bg-sand/50'}`}>{t}</button>)}
        </div>
        {!list ? <p className="text-latte">Loading reservations…</p> : !shown.length ? <p className="rounded-3xl bg-white shadow-[0_12px_32px_rgba(43,29,22,.07)] px-5 py-10 text-center text-latte">No {show} reservations.</p> : (
          <div className="grid gap-4 xl:grid-cols-2">
            {shown.map((r) => (
              <article key={r.id} className="rounded-3xl bg-white shadow-[0_12px_32px_rgba(43,29,22,.07)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl font-[800] tracking-tight text-espresso">{new Date(r.date + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} · {r.time} · {r.guests} {r.guests === 1 ? 'guest' : 'guests'}</p>
                    <p className="text-sm">{r.name} · <a className="text-mocha hover:underline" href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}>{r.phone}</a> · {r.email}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STYLE[r.status]}`}>{r.status}</span>
                </div>
                {r.note && <p className="mt-2 text-sm italic">“{r.note}”</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.status !== 'confirmed' && <button onClick={() => setStatus(r, 'confirmed')} className="rounded-full bg-roast px-4 py-2 text-sm font-medium text-cream hover:bg-mocha">Confirm</button>}
                  {r.status === 'requested' && <button onClick={() => setStatus(r, 'declined')} className="rounded-full border border-line px-4 py-2 text-sm hover:border-mocha">Decline</button>}
                  {r.status !== 'cancelled' && <button onClick={() => setStatus(r, 'cancelled')} className="rounded-full px-4 py-2 text-sm text-[#b4442f] hover:bg-[#fbeeea]">Cancel</button>}
                  <a href={`https://wa.me/${waNumber(r.phone)}?text=${encodeURIComponent(`Hi ${r.name.split(' ')[0]}, your Sip & Soul Café table for ${r.guests} on ${r.date} at ${r.time} is confirmed. See you soon!`)}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#25d366] px-4 py-2 text-sm font-medium text-white">WhatsApp</a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="rounded-3xl bg-white shadow-[0_12px_32px_rgba(43,29,22,.07)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl font-[800] tracking-tight text-espresso">Newsletter subscribers <span className="text-sm text-latte">({subs.length})</span></h2>
          {subs.length > 0 && <button onClick={() => navigator.clipboard.writeText(subs.map((s) => s.email).join(', '))} className="text-sm text-mocha hover:underline">Copy all emails</button>}
        </div>
        {!subs.length ? <p className="px-5 py-8 text-center text-latte">No subscribers yet.</p> : (
          <ul className="divide-y divide-line text-sm">{subs.map((s) => <li key={s.id} className="flex items-center justify-between px-5 py-2.5"><span>{s.email}</span><span className="flex items-center gap-4 text-latte">{new Date(s.createdAt).toLocaleDateString()}<button onClick={() => removeSub(s)} className="text-[#b4442f] hover:underline">Remove</button></span></li>)}</ul>
        )}
      </section>
    </div>
  )
}
