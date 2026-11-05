import { useEffect, useState } from 'react'
import { Avatar, Modal } from '../components/shop/ui'
import { api, ApiError } from '../lib/api'
import { useStore } from '../state/store'

interface ResetRequest { id: string; createdAt: string; customer: { id: string; name: string; email: string; phone: string } }
interface LinkFor { name: string; phone: string; url: string; expiresAt: string }

/** WhatsApp wants the number in international form: 077 123 4567 → 94771234567. */
const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, '')
  return d.startsWith('0') ? `94${d.slice(1)}` : d
}

function ResetLink({ link, onClose }: { link: LinkFor; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const message = `Hi ${link.name.split(' ')[0]}, here is your Sip & Soul Café password reset link. It works once and expires in 1 hour:\n${link.url}`
  return (
    <Modal title="Reset link ready" onClose={onClose}>
      <p className="text-sm text-latte">Send this link to <b className="text-roast">{link.name}</b>. It works once and expires at {new Date(link.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Creating a new link cancels the old one.</p>
      <div className="mt-4 rounded-lg border border-line bg-white p-3 font-mono text-xs break-all text-roast">{link.url}</div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <a href={`https://wa.me/${waNumber(link.phone)}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#25d366] px-5 py-3 text-center text-sm font-medium text-white transition hover:brightness-95">Send on WhatsApp</a>
        <button onClick={() => navigator.clipboard.writeText(link.url).then(() => setCopied(true))} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-medium text-roast transition hover:border-mocha">{copied ? 'Copied ✓' : 'Copy link'}</button>
      </div>
    </Modal>
  )
}

interface Customer { id: string; name: string; email: string; phone: string; role: 'customer' | 'admin'; avatar: string | null; blocked: boolean; createdAt: string; orders: number }

export function CustomersAdmin() {
  const { user } = useStore()
  const [list, setList] = useState<Customer[] | null>(null)
  const [q, setQ] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [requests, setRequests] = useState<ResetRequest[]>([])
  const [link, setLink] = useState<LinkFor | null>(null)

  const load = () => Promise.all([
    api<Customer[]>('/admin/customers').then(setList),
    api<ResetRequest[]>('/admin/password-resets').then(setRequests),
  ]).catch((e: ApiError) => setError(e.message))
  useEffect(() => { void load() }, [])

  async function makeLink(c: { id: string; name: string; phone: string }) {
    setError('')
    try {
      const r = await api<{ url: string; expiresAt: string }>(`/admin/password-resets/customers/${c.id}/link`, { method: 'POST' })
      setLink({ name: c.name, phone: c.phone, ...r })
      void load()
    } catch (e) {
      setError((e as ApiError).message)
    }
  }

  async function dismiss(r: ResetRequest) {
    await api(`/admin/password-resets/${r.id}`, { method: 'DELETE' }).catch((e: ApiError) => setError(e.message))
    void load()
  }

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
      {requests.length > 0 && (
        <section className="rounded-3xl bg-white shadow-[0_12px_32px_rgba(43,29,22,.07)] ring-2 ring-terra/40">
          <h2 className="border-b border-line px-5 py-4 font-display text-2xl font-[800] tracking-tight text-espresso">Password reset requests <span className="ml-1 rounded-full bg-gold/30 px-2 py-0.5 font-sans text-xs text-roast">{requests.length}</span></h2>
          <ul className="divide-y divide-line">
            {requests.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 text-sm">
                <div className="min-w-[200px] flex-1">
                  <p className="font-medium text-roast">{r.customer.name}</p>
                  <p className="text-xs text-latte">{r.customer.email} · {r.customer.phone} · asked {new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => makeLink(r.customer)} className="rounded-full bg-roast px-4 py-2 text-xs font-medium text-cream hover:bg-mocha">Create reset link</button>
                <button onClick={() => dismiss(r)} className="rounded-full px-3 py-2 text-xs text-latte hover:text-roast">Dismiss</button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <input
        type="search"
        aria-label="Search customers"
        placeholder="Search by name, email or phone…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full max-w-md rounded-full bg-white px-6 py-3 shadow-[0_8px_24px_rgba(43,29,22,.06)] text-sm outline-none focus:border-mocha focus:ring-2 focus:ring-gold/40"
      />
      {error && <p role="alert" className="text-[#b4442f]">{error}</p>}
      {!list ? <p className="text-latte">Loading customers…</p> : (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-[0_12px_32px_rgba(43,29,22,.07)]">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-cream-2/70 text-left text-[11px] font-semibold tracking-[.15em] text-latte uppercase">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-roast"><span className="inline-flex items-center gap-3"><Avatar name={c.name} src={c.avatar} size={36} /><span>{c.name}</span></span>{c.role === 'admin' && <span className="ml-2 rounded-full bg-gold/30 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-roast uppercase">Admin</span>}</td>
                  <td className="px-4 py-3"><div>{c.email}</div><div className="text-xs text-latte">{c.phone}</div></td>
                  <td className="px-4 py-3 text-latte">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{c.orders}</td>
                  <td className="px-4 py-3">{c.blocked ? <span className="rounded-full bg-[#f6e1dc] px-3 py-1 text-xs font-semibold text-[#8f3424]">Blocked</span> : <span className="rounded-full bg-[#dcefe0] px-3 py-1 text-xs font-semibold text-[#2d6a3a]">Active</span>}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {c.role === 'customer' && c.id !== user?.id && (
                      <>
                        <button disabled={busy === c.id || c.blocked} onClick={() => makeLink(c)} className="rounded-full px-3 py-1.5 text-mocha hover:bg-cream disabled:opacity-40">Reset link</button>
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
      {link && <ResetLink link={link} onClose={() => setLink(null)} />}
    </div>
  )
}
