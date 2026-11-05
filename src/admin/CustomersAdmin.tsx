import { useEffect, useState } from 'react'
import { api, ApiError } from '../lib/api'
import { useStore } from '../state/store'

interface Customer { id: string; name: string; email: string; phone: string; role: 'customer' | 'admin'; blocked: boolean; createdAt: string; orders: number }

export function CustomersAdmin() {
  const { user } = useStore()
  const [list, setList] = useState<Customer[] | null>(null)
  const [q, setQ] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const load = () => api<Customer[]>('/admin/customers').then(setList).catch((e: ApiError) => setError(e.message))
  useEffect(() => { void load() }, [])

  async function act(c: Customer, action: 'block' | 'unblock' | 'delete') {
    const ask = {
      block: `Block ${c.name}? They will be signed out and can't sign in or order until you unblock them.`,
      unblock: `Unblock ${c.name}?`,
      delete: `Delete ${c.name}'s account and their ${c.orders} order(s)? This cannot be undone.`,
    }[action]
    if (!confirm(ask)) return
    setBusy(c.id)
    setError('')
    try {
      if (action === 'delete') await api(`/admin/customers/${c.id}`, { method: 'DELETE' })
      else await api(`/admin/customers/${c.id}`, { method: 'PATCH', json: { blocked: action === 'block' } })
      await load()
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setBusy(null)
    }
  }

  const term = q.trim().toLowerCase()
  const shown = (list ?? []).filter((c) => !term || [c.name, c.email, c.phone].some((v) => v.toLowerCase().includes(term)))

  return (
    <div className="grid gap-5">
      <input
        type="search"
        aria-label="Search customers"
        placeholder="Search by name, email or phone…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full max-w-md rounded-full border border-line bg-white px-5 py-2.5 text-sm outline-none focus:border-mocha focus:ring-2 focus:ring-gold/40"
      />
      {error && <p role="alert" className="text-[#b4442f]">{error}</p>}
      {!list ? <p className="text-latte">Loading customers…</p> : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-cream text-left text-xs tracking-wide text-latte uppercase">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-roast">{c.name}{c.role === 'admin' && <span className="ml-2 rounded-full bg-gold/30 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-roast uppercase">Admin</span>}</td>
                  <td className="px-4 py-3"><div>{c.email}</div><div className="text-xs text-latte">{c.phone}</div></td>
                  <td className="px-4 py-3 text-latte">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{c.orders}</td>
                  <td className="px-4 py-3">{c.blocked ? <span className="rounded-full bg-[#f6e1dc] px-3 py-1 text-xs font-semibold text-[#8f3424]">Blocked</span> : <span className="rounded-full bg-[#dcefe0] px-3 py-1 text-xs font-semibold text-[#2d6a3a]">Active</span>}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {c.role === 'customer' && c.id !== user?.id && (
                      <>
                        <button disabled={busy === c.id} onClick={() => act(c, c.blocked ? 'unblock' : 'block')} className="rounded-full px-3 py-1.5 text-mocha hover:bg-cream disabled:opacity-50">{c.blocked ? 'Unblock' : 'Block'}</button>
                        <button disabled={busy === c.id} onClick={() => act(c, 'delete')} className="rounded-full px-3 py-1.5 text-[#b4442f] hover:bg-[#fbeeea] disabled:opacity-50">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-latte">{term ? 'No customers match your search.' : 'No customers yet.'}</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
