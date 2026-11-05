import { useEffect, useState, type FormEvent } from 'react'
import { Alert, Field, Modal, Submit, TextArea } from '../components/shop/ui'
import { api, ApiError } from '../lib/api'
import type { MenuItem } from '../lib/types'
import { hasErrors } from '../lib/validate'
import { useStore } from '../state/store'

type Draft = Omit<MenuItem, 'id' | 'price'> & { id?: string; price: string }
const blank = (sortOrder: number): Draft => ({ name: '', description: '', price: '', category: 'hot', image: '', available: true, featured: true, sortOrder })
const MAX_MB = 3

function Editor({ draft: initial, onClose, onSaved }: { draft: Draft; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState(initial)
  const [touched, setTouched] = useState(false)
  const [server, setServer] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  const price = Number(d.price)
  const errors = {
    name: d.name.trim().length < 2 || d.name.trim().length > 60 ? 'Drink name must be 2 to 60 characters.' : '',
    description: d.description.length > 200 ? 'Description must be 200 characters or fewer.' : '',
    price: !d.price.trim() ? 'Enter a price.' : !/^\d+(\.\d{1,2})?$/.test(d.price.trim()) ? 'Use a number like 4.50 (up to 2 decimals).' : price <= 0 ? 'Price must be more than 0.' : price > 100000 ? 'Price is too high.' : '',
    image: d.image ? '' : 'Add a photo of the drink.',
  }
  const show = (k: keyof typeof errors) => (touched ? errors[k] : '') || server[k]
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => { setD((x) => ({ ...x, [k]: v })); setServer((s) => ({ ...s, [k]: '' })) }

  async function upload(file: File) {
    setMessage('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setServer((s) => ({ ...s, image: 'Choose a JPG, PNG or WebP photo.' }))
    if (file.size > MAX_MB * 1024 * 1024) return setServer((s) => ({ ...s, image: `The photo must be ${MAX_MB} MB or smaller.` }))
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const { url } = await api<{ url: string }>('/admin/images', { method: 'POST', body })
      set('image', url)
    } catch (e) {
      setServer((s) => ({ ...s, image: (e as ApiError).message }))
    } finally {
      setUploading(false)
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    setMessage('')
    if (hasErrors(errors)) return
    setBusy(true)
    try {
      const json = { name: d.name.trim(), description: d.description.trim(), price: Number(d.price), category: d.category, image: d.image, available: d.available, featured: d.featured, sortOrder: d.sortOrder }
      await api(d.id ? `/admin/menu/${d.id}` : '/admin/menu', { method: d.id ? 'PATCH' : 'POST', json })
      onSaved()
    } catch (err) {
      setServer((err as ApiError).fields)
      setMessage((err as ApiError).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={d.id ? `Edit ${initial.name}` : 'Add a drink'} onClose={onClose}>
      <Alert>{message}</Alert>
      <form noValidate onSubmit={save} className="grid gap-4">
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-roast">Photo</span>
          <div className="flex items-center gap-4">
            <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-cream-2 text-xs text-latte">
              {d.image ? <img src={d.image} alt="" className="size-full object-cover" /> : 'No photo'}
            </div>
            <label className={`cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-roast transition hover:border-mocha ${uploading ? 'opacity-60' : ''}`}>
              {uploading ? 'Uploading…' : d.image ? 'Change photo' : 'Upload photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
          </div>
          <span className={`mt-1 block text-xs ${show('image') ? 'text-[#b4442f]' : 'text-latte'}`}>{show('image') || `JPG, PNG or WebP, up to ${MAX_MB} MB. A square photo looks best.`}</span>
        </div>
        <Field label="Drink name" value={d.name} maxLength={60} onChange={(e) => set('name', e.target.value)} error={show('name')} placeholder="Flat White" />
        <TextArea label="Short description" rows={2} value={d.description} maxLength={200} onChange={(e) => set('description', e.target.value)} error={show('description')} hint={`${d.description.length}/200`} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price" inputMode="decimal" value={d.price} onChange={(e) => set('price', e.target.value)} error={show('price')} placeholder="4.50" />
          <Field label="Order on menu" type="number" min={0} max={999} value={d.sortOrder} onChange={(e) => set('sortOrder', Math.max(0, Math.min(999, Math.round(Number(e.target.value) || 0))))} hint="Lower numbers show first." />
        </div>
        <fieldset>
          <legend className="mb-1.5 text-[13px] font-medium text-roast">Menu group</legend>
          <div className="grid grid-cols-3 gap-2">
            {(['hot', 'cold', 'beans'] as const).map((c) => (
              <label key={c} className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm capitalize transition ${d.category === c ? 'border-roast bg-roast text-cream' : 'border-line bg-white hover:border-mocha'}`}>
                <input type="radio" name="category" className="sr-only" checked={d.category === c} onChange={() => set('category', c)} />
                {c}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={d.available} onChange={(e) => set('available', e.target.checked)} className="size-4 accent-[#3a2418]" /> Available to order</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={d.featured} onChange={(e) => set('featured', e.target.checked)} className="size-4 accent-[#3a2418]" /> Show on the homepage (“Coffee Favorites”)</label>
        <Submit busy={busy}>{d.id ? 'Save changes' : 'Add to menu'}</Submit>
      </form>
    </Modal>
  )
}

export function MenuAdmin() {
  const { money, reloadContent } = useStore()
  const [items, setItems] = useState<MenuItem[] | null>(null)
  const [editing, setEditing] = useState<Draft | null>(null)
  const [error, setError] = useState('')

  const load = () => api<MenuItem[]>('/admin/menu').then(setItems).catch((e: ApiError) => setError(e.message))
  useEffect(() => { void load() }, [])
  const changed = () => { setEditing(null); void load(); void reloadContent() }

  async function quick(m: MenuItem, patch: Partial<MenuItem>) {
    try {
      const next = { ...m, ...patch }
      const json = { name: next.name, description: next.description, price: next.price, category: next.category, image: next.image, available: next.available, featured: next.featured, sortOrder: next.sortOrder }
      await api(`/admin/menu/${m.id}`, { method: 'PATCH', json })
      changed()
    } catch (e) {
      setError((e as ApiError).message)
    }
  }

  async function remove(m: MenuItem) {
    if (!confirm(`Delete ${m.name} from the menu? Past orders keep their details.`)) return
    try {
      await api(`/admin/menu/${m.id}`, { method: 'DELETE' })
      changed()
    } catch (e) {
      setError((e as ApiError).message)
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-latte">Drinks marked “On homepage” appear in Coffee Favorites (up to 8). All available drinks appear in the full menu.</p>
        <button onClick={() => setEditing(blank((items?.length ?? 0)))} className="rounded-full bg-roast px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-mocha">+ Add a drink</button>
      </div>
      {error && <p role="alert" className="text-[#b4442f]">{error}</p>}
      {!items ? <p className="text-latte">Loading menu…</p> : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-xs tracking-wide text-latte uppercase">
              <tr><th className="px-4 py-3">Drink</th><th className="px-4 py-3">Price</th><th className="hidden px-4 py-3 md:table-cell">Available</th><th className="hidden px-4 py-3 md:table-cell">On homepage</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((m) => (
                <tr key={m.id} className={m.available ? '' : 'opacity-60'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={m.image} alt="" className="size-12 rounded-lg object-cover" />
                      <div><p className="font-medium text-roast">{m.name} <span className="ml-1 rounded-full bg-cream-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-latte uppercase">{m.category}</span></p><p className="line-clamp-1 max-w-[260px] text-xs text-latte">{m.description}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{money(m.price)}</td>
                  <td className="hidden px-4 py-3 md:table-cell"><Toggle on={m.available} label={`${m.name} available`} onChange={(v) => quick(m, { available: v })} /></td>
                  <td className="hidden px-4 py-3 md:table-cell"><Toggle on={m.featured} label={`${m.name} on homepage`} onChange={(v) => quick(m, { featured: v })} /></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing({ ...m, price: m.price.toFixed(2) })} className="rounded-full px-3 py-1.5 text-mocha hover:bg-cream">Edit</button>
                    <button onClick={() => remove(m)} className="rounded-full px-3 py-1.5 text-[#b4442f] hover:bg-[#fbeeea]">Delete</button>
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-latte">No drinks yet. Add your first one.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {editing && <Editor draft={editing} onClose={() => setEditing(null)} onSaved={changed} />}
    </div>
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-[#4d8a5a]' : 'bg-line'}`}>
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}
