import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaultMenu, defaultSite } from '../data/defaults'
import { api } from '../lib/api'
import type { MenuItem, SiteContent, User } from '../lib/types'

export interface CartLine { productId: string; name: string; price: number; image: string; quantity: number }
export type Panel = null | 'login' | 'register' | 'forgot' | 'admin-reset' | 'cart' | 'account' | 'menu'

interface Store {
  site: SiteContent
  menu: MenuItem[]
  /** False when the site runs without its server (GitHub Pages copy). */
  online: boolean
  user: User | null
  setUser: (u: User | null) => void
  logout: () => Promise<void>
  cart: CartLine[]
  addToCart: (item: MenuItem) => void
  setQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  panel: Panel
  /** After signing in, go here (e.g. back to the cart to finish checking out). */
  openPanel: (p: Panel, after?: Panel) => void
  afterLogin: Panel
  money: (n: number) => string
  reloadContent: () => Promise<void>
}

const Ctx = createContext<Store | null>(null)
const CART_KEY = 'sipsoul-cart'
const MAX_QTY = 20

function loadCart(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((l) => l && typeof l.productId === 'string' && l.quantity > 0).slice(0, 30) : []
  } catch {
    return []
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteContent>(defaultSite)
  const [menu, setMenu] = useState<MenuItem[]>(defaultMenu)
  const [online, setOnline] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [cart, setCart] = useState<CartLine[]>(loadCart)
  const [panel, setPanel] = useState<Panel>(null)
  const [afterLogin, setAfterLogin] = useState<Panel>(null)

  const reloadContent = useCallback(async () => {
    try {
      const [s, m] = await Promise.all([api<SiteContent>('/site'), api<MenuItem[]>('/menu')])
      setSite(s)
      setMenu(m)
      setOnline(true)
      // Keep cart prices and names in step with the menu; drop drinks that were removed.
      setCart((c) => c.flatMap((l) => {
        const p = m.find((x) => x.id === l.productId)
        return p ? [{ ...l, name: p.name, price: p.price, image: p.image }] : []
      }))
    } catch {
      setOnline(false)
    }
  }, [])

  useEffect(() => {
    void reloadContent()
    api<{ user: User | null }>('/auth/session').then((s) => setUser(s.user)).catch(() => setUser(null))
  }, [reloadContent])

  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(cart)), [cart])

  const value = useMemo<Store>(() => ({
    site, menu, online, user, setUser, cart, panel, afterLogin,
    logout: async () => {
      await api('/auth/logout', { method: 'POST' }).catch(() => {})
      setUser(null)
      setPanel(null)
    },
    addToCart: (item) => setCart((c) => {
      const line = c.find((l) => l.productId === item.id)
      if (line) return c.map((l) => (l === line ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + 1) } : l))
      return [...c, { productId: item.id, name: item.name, price: item.price, image: item.image, quantity: 1 }]
    }),
    setQuantity: (id, q) => setCart((c) => (q <= 0 ? c.filter((l) => l.productId !== id) : c.map((l) => (l.productId === id ? { ...l, quantity: Math.min(MAX_QTY, q) } : l)))),
    clearCart: () => setCart([]),
    cartCount: cart.reduce((n, l) => n + l.quantity, 0),
    cartTotal: cart.reduce((n, l) => n + l.price * l.quantity, 0),
    openPanel: (p, after = null) => {
      setPanel(p)
      setAfterLogin(after)
    },
    money: (n) => `${site.currency}${n.toFixed(2)}`,
    reloadContent,
  }), [site, menu, online, user, cart, panel, afterLogin, reloadContent])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside StoreProvider')
  return s
}
