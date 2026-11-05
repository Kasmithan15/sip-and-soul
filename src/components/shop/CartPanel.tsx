import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../../lib/api'
import type { Order } from '../../lib/types'
import { hasErrors, rules } from '../../lib/validate'
import { useStore } from '../../state/store'
import { Alert, Field, Modal, Submit, TextArea } from './ui'

export function CartPanel() {
  const { cart, setQuantity, cartTotal, money, user, openPanel, clearCart, online, reloadContent } = useStore()
  const [type, setType] = useState<'pickup' | 'delivery'>('pickup')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [touched, setTouched] = useState(false)
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [placed, setPlaced] = useState<Order | null>(null)

  const errors = {
    phone: rules.phone(phone),
    address: type === 'delivery' ? (address.trim().length < 10 ? 'Enter your full delivery address (at least 10 characters).' : address.length > 200 ? 'Address must be 200 characters or fewer.' : '') : '',
    note: note.length > 300 ? 'Note must be 300 characters or fewer.' : '',
  }
  const show = (k: keyof typeof errors) => (touched ? errors[k] : '') || serverErrors[k]

  async function checkout(e: FormEvent) {
    e.preventDefault()
    if (!user) return openPanel('login', 'cart')
    setTouched(true)
    setMessage('')
    if (hasErrors(errors)) return
    setBusy(true)
    try {
      const order = await api<Order>('/orders', {
        method: 'POST',
        json: { items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })), type, phone, address: type === 'delivery' ? address : undefined, note: note || undefined },
      })
      setPlaced(order)
      clearCart()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) return openPanel('login', 'cart')
        setServerErrors(err.fields)
        setMessage(err.message)
        void reloadContent()
      }
    } finally {
      setBusy(false)
    }
  }

  if (placed) {
    return (
      <Modal drawer title="Order placed" onClose={() => openPanel(null)}>
        <div className="py-8 text-center">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-gold/30 text-3xl">☕</div>
          <h3 className="font-serif text-3xl text-roast">Thank you, {user?.name.split(' ')[0]}!</h3>
          <p className="mt-3 text-latte">Your order <b className="text-roast">#{placed.number}</b> for {money(placed.total)} has been received.</p>
          <p className="mt-1 text-sm text-latte">{placed.type === 'pickup' ? 'We will have it ready for pickup soon.' : 'We will deliver it to your address soon.'}</p>
          <button onClick={() => openPanel('account')} className="mt-8 rounded-full bg-roast px-6 py-3 text-sm font-medium text-cream transition hover:bg-mocha">Track my order</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal drawer title="Your cart" onClose={() => openPanel(null)}>
      {!cart.length ? (
        <div className="py-16 text-center">
          <p className="font-serif text-2xl text-roast">Your cart is empty</p>
          <p className="mt-2 text-sm text-latte">Add a drink from the menu to get started.</p>
          <button onClick={() => openPanel('menu')} className="mt-6 rounded-full bg-roast px-6 py-3 text-sm font-medium text-cream transition hover:bg-mocha">See the menu</button>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-line">
            {cart.map((l) => (
              <li key={l.productId} className="flex items-center gap-3 py-3">
                <img src={l.image} alt="" className="size-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-roast">{l.name}</p>
                  <p className="text-sm text-latte">{money(l.price)} each</p>
                </div>
                <div className="flex items-center rounded-full border border-line bg-white">
                  <button aria-label={`One less ${l.name}`} onClick={() => setQuantity(l.productId, l.quantity - 1)} className="grid size-8 place-items-center rounded-full text-lg hover:bg-cream-2">−</button>
                  <span className="w-6 text-center text-sm font-medium" aria-live="polite">{l.quantity}</span>
                  <button aria-label={`One more ${l.name}`} disabled={l.quantity >= 20} onClick={() => setQuantity(l.productId, l.quantity + 1)} className="grid size-8 place-items-center rounded-full text-lg hover:bg-cream-2 disabled:opacity-40">+</button>
                </div>
                <button aria-label={`Remove ${l.name}`} onClick={() => setQuantity(l.productId, 0)} className="text-sm text-latte hover:text-[#b4442f]">✕</button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-line pt-4 font-serif text-xl text-roast">
            <span>Total</span>
            <span>{money(cartTotal)}</span>
          </div>

          <form noValidate onSubmit={checkout} className="mt-6 grid gap-4">
            <Alert>{message}</Alert>
            {!online && <Alert tone="info">Online ordering needs the café server. This copy of the site is a preview only.</Alert>}
            {user ? (
              <>
                <fieldset>
                  <legend className="mb-1.5 text-[13px] font-medium text-roast">How would you like it?</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(['pickup', 'delivery'] as const).map((t) => (
                      <label key={t} className={`cursor-pointer rounded-lg border px-4 py-3 text-center text-sm font-medium capitalize transition ${type === t ? 'border-roast bg-roast text-cream' : 'border-line bg-white text-roast hover:border-mocha'}`}>
                        <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="sr-only" />
                        {t === 'pickup' ? 'Pick up' : 'Delivery'}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field label="Phone number" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={show('phone')} />
                {type === 'delivery' && <TextArea label="Delivery address" rows={2} autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} error={show('address')} placeholder="House no, street, city" />}
                <TextArea label="Note for the barista (optional)" rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} error={show('note')} hint={`${note.length}/300`} placeholder="Less sugar, oat milk…" />
                <Submit busy={busy}>Place order · {money(cartTotal)}</Submit>
                <p className="text-center text-xs text-latte">Pay when you collect or on delivery.</p>
              </>
            ) : (
              <Submit>Sign in to check out</Submit>
            )}
          </form>
        </>
      )}
    </Modal>
  )
}
