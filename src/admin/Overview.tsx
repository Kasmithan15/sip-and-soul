import { useEffect, useState } from 'react'
import { api, ApiError } from '../lib/api'
import { STATUS_LABEL, STATUS_STYLE, type Order } from '../lib/types'
import { useStore } from '../state/store'
import type { Tab } from './Admin'

interface Stats { ordersToday: number; openOrders: number; revenue: number; customers: number; products: number }

export function Overview({ go }: { go: (t: Tab) => void }) {
  const { money } = useStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<Order[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api<Stats>('/admin/stats'), api<Order[]>('/admin/orders')])
      .then(([s, o]) => { setStats(s); setRecent(o.slice(0, 6)) })
      .catch((e: ApiError) => setError(e.message))
  }, [])

  const cards = stats && [
    { label: 'Orders today', value: stats.ordersToday, tab: 'orders' as Tab, hot: false },
    { label: 'Open orders', value: stats.openOrders, tab: 'orders' as Tab, hot: stats.openOrders > 0 },
    { label: 'Completed sales', value: money(stats.revenue), tab: 'orders' as Tab },
    { label: 'Customers', value: stats.customers, tab: 'customers' as Tab },
    { label: 'Drinks on the menu', value: stats.products, tab: 'menu' as Tab },
  ]

  return (
    <div className="grid gap-8">
      {error && <p className="text-[#b4442f]">{error}</p>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {(cards ?? Array.from({ length: 5 })).map((c, i) => (
          <button
            key={i}
            onClick={() => c && go(c.tab)}
            className={`relative overflow-hidden rounded-3xl p-6 text-left transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(43,29,22,.14)] ${i === 0 ? 'bg-terra text-white shadow-[0_18px_40px_rgba(192,98,59,.35)]' : 'bg-white shadow-[0_12px_32px_rgba(43,29,22,.07)]'}`}
          >
            {i === 0 && <span aria-hidden className="absolute -top-8 -right-8 size-28 rounded-full bg-white/15" />}
            <p className={`text-xs font-semibold tracking-[.15em] uppercase ${i === 0 ? 'text-white/80' : 'text-latte'}`}>{c?.label ?? '…'}</p>
            <p className="mt-3 font-display text-5xl leading-none font-[900] tracking-tight">{c?.value ?? '–'}</p>
            {c?.hot && <span className="mt-3 inline-block rounded-full bg-terra/15 px-2.5 py-1 text-[11px] font-semibold text-terra">Needs attention</span>}
          </button>
        ))}
      </div>
      <section className="rounded-3xl bg-white shadow-[0_12px_32px_rgba(43,29,22,.07)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl font-[800] tracking-tight text-espresso">Latest orders</h2>
          <button onClick={() => go('orders')} className="text-sm text-mocha hover:underline">All orders →</button>
        </div>
        {!recent.length ? <p className="px-5 py-8 text-center text-latte">No orders yet.</p> : (
          <ul className="divide-y divide-line">
            {recent.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
                <span className="w-14 font-display text-lg font-[800]">#{o.number}</span>
                <span className="min-w-[140px] flex-1">{o.user?.name}</span>
                <span className="text-latte">{o.items.reduce((n, i) => n + i.quantity, 0)} items</span>
                <span className="w-20 text-right font-medium">{money(o.total)}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
