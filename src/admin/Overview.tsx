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
    { label: 'Orders today', value: stats.ordersToday, tab: 'orders' as Tab },
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
          <button key={i} onClick={() => c && go(c.tab)} className={`rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${c?.hot ? 'border-gold' : 'border-line'}`}>
            <p className="text-xs tracking-wide text-latte uppercase">{c?.label ?? '…'}</p>
            <p className="mt-2 font-serif text-3xl text-roast">{c?.value ?? '–'}</p>
          </button>
        ))}
      </div>
      <section className="rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-serif text-xl text-roast">Latest orders</h2>
          <button onClick={() => go('orders')} className="text-sm text-mocha hover:underline">All orders →</button>
        </div>
        {!recent.length ? <p className="px-5 py-8 text-center text-latte">No orders yet.</p> : (
          <ul className="divide-y divide-line">
            {recent.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
                <span className="w-14 font-medium text-roast">#{o.number}</span>
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
