import { useCallback, useEffect, useState } from 'react'
import { Avatar } from '../components/shop/ui'
import { api, ApiError } from '../lib/api'
import { STATUS_LABEL, STATUS_STYLE, type Order, type OrderStatus } from '../lib/types'
import { useStore } from '../state/store'

const FILTERS: ('open' | 'all' | OrderStatus)[] = ['open', 'pending', 'preparing', 'ready', 'completed', 'cancelled', 'all']
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ['preparing', 'ready', 'completed', 'cancelled'],
  preparing: ['ready', 'completed', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export function OrdersAdmin() {
  const { money } = useStore()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('open')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  const load = useCallback(() => api<Order[]>('/admin/orders').then((o) => { setOrders(o); setError('') }).catch((e: ApiError) => setError(e.message)), [])
  useEffect(() => {
    void load()
    const id = setInterval(load, 15_000) // new orders appear without refreshing
    return () => clearInterval(id)
  }, [load])

  async function setStatus(o: Order, status: OrderStatus) {
    if (status === 'cancelled' && !confirm(`Cancel order #${o.number} for ${o.user?.name}?`)) return
    setSaving(o.id)
    try {
      const updated = await api<Order>(`/admin/orders/${o.id}`, { method: 'PATCH', json: { status } })
      setOrders((list) => list?.map((x) => (x.id === o.id ? updated : x)) ?? null)
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setSaving(null)
    }
  }

  const shown = (orders ?? []).filter((o) => filter === 'all' || (filter === 'open' ? ['pending', 'preparing', 'ready'].includes(o.status) : o.status === filter))
  const count = (f: (typeof FILTERS)[number]) => (orders ?? []).filter((o) => f === 'all' || (f === 'open' ? ['pending', 'preparing', 'ready'].includes(o.status) : o.status === f)).length

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-sm capitalize transition ${filter === f ? 'bg-espresso text-cream shadow-[0_8px_20px_rgba(43,29,22,.2)]' : 'bg-white text-espresso hover:bg-sand/50'}`}>
            {f === 'open' ? 'Open' : f === 'all' ? 'All' : STATUS_LABEL[f]} <span className="opacity-60">({count(f)})</span>
          </button>
        ))}
      </div>
      {error && <p role="alert" className="text-[#b4442f]">{error}</p>}
      {!orders ? <p className="text-latte">Loading orders…</p> : !shown.length ? <p className="rounded-3xl bg-white shadow-[0_12px_32px_rgba(43,29,22,.07)] px-5 py-10 text-center text-latte">No orders here.</p> : (
        <div className="grid gap-4 xl:grid-cols-2">
          {shown.map((o) => (
            <article key={o.id} className="rounded-3xl bg-white shadow-[0_12px_32px_rgba(43,29,22,.07)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={o.user?.name ?? '?'} src={o.user?.avatar} size={44} />
                  <div>
                  <p className="font-display text-2xl font-[800] tracking-tight text-espresso">#{o.number} · {o.user?.name}</p>
                  <p className="text-xs text-latte">{new Date(o.createdAt).toLocaleString()} · {o.user?.email}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
              </div>
              <dl className="mt-3 grid grid-cols-[90px_1fr] gap-y-1 text-sm">
                <dt className="text-latte">Type</dt><dd>{o.type === 'pickup' ? 'Pick up' : 'Delivery'}</dd>
                <dt className="text-latte">Phone</dt><dd><a href={`tel:${o.phone.replace(/[^\d+]/g, '')}`} className="text-mocha hover:underline">{o.phone}</a></dd>
                {o.address && <><dt className="text-latte">Address</dt><dd>{o.address}</dd></>}
                {o.note && <><dt className="text-latte">Note</dt><dd className="italic">“{o.note}”</dd></>}
              </dl>
              <ul className="mt-3 rounded-lg bg-cream p-3 text-sm">
                {o.items.map((i) => <li key={i.productId} className="flex justify-between"><span>{i.quantity} × {i.name}</span><span>{money(i.price * i.quantity)}</span></li>)}
                <li className="mt-1 flex justify-between border-t border-line pt-1 font-medium text-roast"><span>Total</span><span>{money(o.total)}</span></li>
              </ul>
              {NEXT[o.status].length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {NEXT[o.status].map((s) => (
                    <button
                      key={s}
                      disabled={saving === o.id}
                      onClick={() => setStatus(o, s)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${s === 'cancelled' ? 'text-[#b4442f] hover:bg-[#fbeeea]' : s === NEXT[o.status][0] ? 'bg-roast text-cream hover:bg-mocha' : 'border border-line hover:border-mocha'}`}
                    >
                      {s === 'cancelled' ? 'Cancel' : `Mark ${STATUS_LABEL[s].toLowerCase()}`}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
