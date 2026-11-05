import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../lib/api'
import { STATUS_LABEL, STATUS_STYLE, type Order, type User } from '../../lib/types'
import { hasErrors, rules } from '../../lib/validate'
import { useStore } from '../../state/store'
import { Alert, Field, Modal, PasswordField, Submit } from './ui'

const STEPS: Order['status'][] = ['pending', 'preparing', 'ready', 'completed']

function Orders() {
  const { money } = useStore()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')
  const load = useCallback(() => api<Order[]>('/orders/mine').then(setOrders).catch((e: ApiError) => setError(e.message)), [])

  useEffect(() => {
    void load()
    const id = setInterval(load, 20_000) // keep the status fresh while the panel is open
    return () => clearInterval(id)
  }, [load])

  async function cancel(o: Order) {
    if (!confirm(`Cancel order #${o.number}?`)) return
    try {
      await api(`/orders/${o.id}/cancel`, { method: 'POST' })
      void load()
    } catch (e) {
      setError((e as ApiError).message)
      void load()
    }
  }

  if (!orders) return <p className="py-10 text-center text-latte">{error || 'Loading your orders…'}</p>
  if (!orders.length) return <p className="py-10 text-center text-latte">No orders yet. Your first cup is waiting!</p>
  return (
    <div className="grid gap-3">
      <Alert>{error}</Alert>
      {orders.map((o) => (
        <article key={o.id} className="rounded-xl border border-line bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-serif text-lg text-roast">Order #{o.number}</p>
              <p className="text-xs text-latte">{new Date(o.createdAt).toLocaleString()} · {o.type === 'pickup' ? 'Pick up' : 'Delivery'}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
          </div>
          {o.status !== 'cancelled' && (
            <div className="mt-3 flex gap-1" aria-hidden>
              {STEPS.map((s, i) => <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= STEPS.indexOf(o.status) ? 'bg-mocha' : 'bg-line'}`} />)}
            </div>
          )}
          <ul className="mt-3 text-sm text-brown">
            {o.items.map((i) => <li key={i.productId} className="flex justify-between"><span>{i.quantity} × {i.name}</span><span>{money(i.price * i.quantity)}</span></li>)}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
            <span className="font-medium text-roast">Total {money(o.total)}</span>
            {o.status === 'pending' && <button onClick={() => cancel(o)} className="text-sm text-[#b4442f] hover:underline">Cancel order</button>}
          </div>
        </article>
      ))}
    </div>
  )
}

function Profile() {
  const { user, setUser } = useStore()
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [touched, setTouched] = useState(false)
  const [server, setServer] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const errors = { name: rules.name(name), phone: rules.phone(phone) }

  async function save(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    setMsg(null)
    if (hasErrors(errors)) return
    setBusy(true)
    try {
      setUser(await api<User>('/auth/me', { method: 'PATCH', json: { name, phone } }))
      setMsg({ tone: 'success', text: 'Your details have been saved.' })
    } catch (err) {
      setServer((err as ApiError).fields)
      setMsg({ tone: 'error', text: (err as ApiError).message })
    } finally {
      setBusy(false)
    }
  }
  return (
    <form noValidate onSubmit={save} className="grid gap-4">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <Field label="Email" value={user?.email ?? ''} disabled hint="Contact the café to change your email." />
      <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={(touched ? errors.name : '') || server.name} autoComplete="name" />
      <Field label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={(touched ? errors.phone : '') || server.phone} autoComplete="tel" />
      <Submit busy={busy}>Save details</Submit>
    </form>
  )
}

function Password() {
  const [f, setF] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [touched, setTouched] = useState(false)
  const [server, setServer] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const errors = {
    currentPassword: f.currentPassword ? '' : 'Enter your current password.',
    newPassword: rules.newPassword(f.newPassword) || (f.newPassword && f.newPassword === f.currentPassword ? 'Choose a password different from your current one.' : ''),
    confirm: f.confirm !== f.newPassword ? 'Passwords do not match.' : '',
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((x) => ({ ...x, [k]: e.target.value }))

  async function save(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    setMsg(null)
    if (hasErrors(errors)) return
    setBusy(true)
    try {
      await api('/auth/password', { method: 'POST', json: { currentPassword: f.currentPassword, newPassword: f.newPassword } })
      setF({ currentPassword: '', newPassword: '', confirm: '' })
      setTouched(false)
      setMsg({ tone: 'success', text: 'Password changed. Other devices have been signed out.' })
    } catch (err) {
      setServer((err as ApiError).fields)
      setMsg({ tone: 'error', text: (err as ApiError).message })
    } finally {
      setBusy(false)
    }
  }
  const show = (k: keyof typeof errors) => (touched ? errors[k] : '') || server[k]
  return (
    <form noValidate onSubmit={save} className="grid gap-4">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <PasswordField label="Current password" autoComplete="current-password" value={f.currentPassword} onChange={set('currentPassword')} error={show('currentPassword')} />
      <PasswordField label="New password" autoComplete="new-password" value={f.newPassword} onChange={set('newPassword')} error={show('newPassword')} hint="At least 8 characters, with letters and numbers." />
      <PasswordField label="Confirm new password" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} error={show('confirm')} />
      <Submit busy={busy}>Change password</Submit>
    </form>
  )
}

export function AccountPanel() {
  const { user, openPanel, logout } = useStore()
  const [tab, setTab] = useState<'orders' | 'profile' | 'password'>('orders')
  if (!user) return null
  return (
    <Modal wide title={`Hi, ${user.name.split(' ')[0]}`} onClose={() => openPanel(null)}>
      <div role="tablist" className="mb-5 flex gap-1 rounded-full bg-cream-2 p-1 text-sm">
        {(['orders', 'profile', 'password'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`flex-1 rounded-full px-4 py-2 font-medium capitalize transition ${tab === t ? 'bg-roast text-cream' : 'text-brown hover:bg-white'}`}>
            {t === 'orders' ? 'My orders' : t}
          </button>
        ))}
      </div>
      {tab === 'orders' ? <Orders /> : tab === 'profile' ? <Profile /> : <Password />}
      <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-line pt-4 text-sm">
        {user.role === 'admin' ? <a href="#/admin" onClick={() => openPanel(null)} className="font-medium text-mocha hover:underline">Open admin panel →</a> : <span />}
        <button onClick={logout} className="text-latte hover:text-roast">Sign out</button>
      </div>
    </Modal>
  )
}
