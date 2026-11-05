import { useState } from 'react'
import { useStore } from '../../state/store'
import { Modal } from './ui'

export function MenuPanel() {
  const { menu, money, addToCart, openPanel, cart } = useStore()
  const [added, setAdded] = useState<string | null>(null)
  return (
    <Modal wide title="Our menu" onClose={() => openPanel(null)}>
      {!menu.length && <p className="py-10 text-center text-latte">The menu is being updated. Please check back soon.</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {menu.map((m) => {
          const inCart = cart.find((l) => l.productId === m.id)?.quantity ?? 0
          return (
            <li key={m.id} className="flex gap-3 rounded-xl border border-line bg-white p-3">
              <img src={m.image} alt={m.name} loading="lazy" className="size-20 shrink-0 rounded-lg object-cover" />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="font-serif text-lg text-roast">{m.name}</p>
                <p className="line-clamp-2 text-xs text-latte">{m.description}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-medium text-mocha">{money(m.price)}</span>
                  <button
                    onClick={() => { addToCart(m); setAdded(m.id); setTimeout(() => setAdded((a) => (a === m.id ? null : a)), 1200) }}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${added === m.id ? 'bg-gold text-roast' : 'bg-roast text-cream hover:bg-mocha'}`}
                  >
                    {added === m.id ? 'Added ✓' : inCart ? `Add another (${inCart})` : 'Add to cart'}
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {cart.length > 0 && (
        <button onClick={() => openPanel('cart')} className="mt-5 w-full rounded-full bg-gold px-6 py-3 font-medium text-roast transition hover:bg-gold-light">View cart & check out →</button>
      )}
    </Modal>
  )
}
