/**
 * Demo mode for copies of the site that have no café server (GitHub Pages).
 * Every API call is answered here, in the browser, with the same rules as the real server,
 * and the data is kept in this browser's localStorage, starting from clean sample data.
 *
 * The demo admin uses a demo-only password (shown on the sign-in screen). It protects
 * nothing real: the data lives only in the visitor's own browser. The real admin password
 * is never part of this public code.
 */
import { defaultMenu, defaultSite } from '../data/defaults'
import { ApiError } from './api'
import type { MenuItem, Order, OrderStatus, SiteContent, User } from './types'
import { EMAIL, NAME, PHONE } from './validate'

/** On github.io (or with ?demo=1 for testing) the site runs in demo mode. */
export const DEMO = (() => {
  try {
    if (new URLSearchParams(location.search).get('demo') === '1') sessionStorage.setItem('sipsoul-demo', '1')
    return location.hostname.endsWith('github.io') || sessionStorage.getItem('sipsoul-demo') === '1'
  } catch {
    return false
  }
})()

/** Demo-only admin login, shown on the sign-in screen of the demo. */
export const DEMO_ADMIN = { email: 'kasmithan15@gmail.com', password: 'SipSoul@Demo1', name: 'Kasmithan' }

const KEY = 'sipsoul-demo-v1'

interface Pw { salt: string; hash: string; iterations: number }
interface DUser extends User { pw: Pw | null; blocked: boolean }
interface DOrder extends Order { userId: string }
interface Reservation { id: string; name: string; phone: string; email: string; date: string; time: string; guests: number; note: string; status: 'requested' | 'confirmed' | 'declined' | 'cancelled'; createdAt: string }
interface Reset { id: string; userId: string; token?: string; expiresAt?: number; createdAt: string }
interface DB {
  users: DUser[]; products: MenuItem[]; orders: DOrder[]; reservations: Reservation[]
  subscribers: { id: string; email: string; createdAt: string }[]; site: SiteContent; resets: Reset[]; session: string | null; nextOrder: number
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36))
const now = () => new Date().toISOString()
const day = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('en-CA') }
const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

async function pbkdf2(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations }, key, 256)
  return b64(bits)
}
// Passwords people choose in the demo are stored as salted hashes, like on the real server.
async function makePw(password: string): Promise<Pw> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return { salt: b64(salt.buffer), hash: await pbkdf2(password, salt, 100_000), iterations: 100_000 }
}
async function checkPw(password: string, pw: Pw | null) {
  if (!pw) return false
  return (await pbkdf2(password, unb64(pw.salt), pw.iterations)) === pw.hash
}

async function seed(): Promise<DB> {
  const products = defaultMenu.map((m, i) => ({ ...m, id: `p${i + 1}` }))
  const people: [string, string, string][] = [
    ['Anushka Fernando', 'anushka@example.com', '077 214 5508'], ['Ravindu Silva', 'ravindu@example.com', '071 880 3412'],
    ['Thilini Perera', 'thilini@example.com', '076 455 9021'], ['Kavindu Jayasinghe', 'kavindu@example.com', '070 312 7745'],
    ['Shenali Wickramasinghe', 'shenali@example.com', '075 690 1183'], ['Dinesh Kumar', 'dinesh@example.com', '078 221 6630'],
  ]
  const users: DUser[] = [
    { id: 'u-admin', name: DEMO_ADMIN.name, email: DEMO_ADMIN.email, phone: '', role: 'admin', avatar: null, createdAt: now(), blocked: false, pw: await makePw(DEMO_ADMIN.password) },
    ...people.map(([name, email, phone], i): DUser => ({ id: `u${i + 1}`, name, email, phone, role: 'customer', avatar: null, createdAt: now(), blocked: false, pw: null })),
  ]
  const p = (n: string) => products.find((x) => x.name.startsWith(n))!
  const line = (n: string, q: number) => ({ productId: p(n).id, name: p(n).name, price: p(n).price, quantity: q })
  const sample: [number, ReturnType<typeof line>[], OrderStatus, 'pickup' | 'delivery', string, string][] = [
    [1, [line('Cappuccino', 2), line('Espresso', 1)], 'pending', 'pickup', '', 'Extra hot please'],
    [2, [line('Cold Brew', 1), line('Iced Latte', 1)], 'preparing', 'delivery', '45 Temple Road, Malabe', ''],
    [3, [line('Café Latte', 2)], 'ready', 'pickup', '', 'Oat milk'],
    [4, [line('Pour-Over', 1), line('House Blend', 1)], 'completed', 'pickup', '', ''],
    [5, [line('Caramel Macchiato', 3)], 'completed', 'delivery', '12 Kaduwela Road, Malabe', 'Ring the bell twice'],
    [6, [line('Espresso', 2)], 'pending', 'pickup', '', ''],
  ]
  const orders: DOrder[] = sample.map(([u, items, status, type, address, note], i) => ({
    id: uid(), number: i + 1, userId: users[u].id, items, total: items.reduce((s, x) => s + x.price * x.quantity, 0), status, type,
    phone: users[u].phone, address, note, createdAt: new Date(Date.now() - (6 - i) * 41 * 60_000).toISOString(),
  }))
  return {
    users, products, orders, site: structuredClone(defaultSite), resets: [], session: null, nextOrder: 7,
    reservations: [
      { id: uid(), name: 'Thilini Perera', phone: '076 455 9021', email: 'thilini@example.com', date: day(1), time: '18:30', guests: 4, note: 'Birthday, window seat if possible', status: 'confirmed', createdAt: now() },
      { id: uid(), name: 'Ravindu Silva', phone: '071 880 3412', email: 'ravindu@example.com', date: day(2), time: '09:00', guests: 2, note: '', status: 'requested', createdAt: now() },
      { id: uid(), name: 'Dinesh Kumar', phone: '078 221 6630', email: 'dinesh@example.com', date: day(4), time: '19:30', guests: 6, note: 'High chair needed', status: 'requested', createdAt: now() },
    ],
    subscribers: ['coffee.lover@example.com', 'anushka@example.com', 'morningbrew@example.com', 'shenali@example.com'].map((email) => ({ id: uid(), email, createdAt: now() })),
  }
}

let cache: DB | null = null
async function load(): Promise<DB> {
  if (cache) return cache
  try { cache = JSON.parse(localStorage.getItem(KEY) ?? 'null') } catch { cache = null }
  if (!cache) { cache = await seed(); save() }
  return cache!
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(cache)) } catch { throw new ApiError('This browser is out of storage for the demo. Reset the demo data and try again.', 507) }
}
/** Puts the demo back to its starting sample data (and signs everyone out). */
export async function resetDemo() { cache = await seed(); save() }

const fail = (status: number, message: string, field?: string): never => { throw new ApiError(message, status, field ? { [field]: message } : {}) }
const pub = (u: DUser): User => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, avatar: u.avatar, createdAt: u.createdAt })
const orderOut = (db: DB, o: DOrder) => {
  const u = db.users.find((x) => x.id === o.userId)
  const { userId: _u, ...rest } = o
  return { ...rest, user: u ? { name: u.name, email: u.email, avatar: u.avatar } : undefined }
}
function me(db: DB) {
  const u = db.users.find((x) => x.id === db.session)
  if (!u) return fail(401, 'Please sign in again.')
  if (u.blocked) { db.session = null; save(); fail(401, 'This account has been blocked.') }
  return u
}
function admin(db: DB) { const u = me(db); if (u.role !== 'admin') fail(403, 'Admin access is required.'); return u }

/** Checks an upload really is a photo, then shrinks it so it fits in browser storage. */
async function photo(file: unknown, max: number) {
  if (!(file instanceof File)) return fail(400, 'Choose a photo to upload.')
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) fail(400, 'Only JPG, PNG or WebP photos can be used.')
  if (file.size > 3 * 1024 * 1024) fail(400, 'The photo must be 3 MB or smaller.')
  let bmp: ImageBitmap
  try { bmp = await createImageBitmap(file) } catch { return fail(400, 'Only JPG, PNG or WebP photos can be used.') }
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.82)
}

const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ['preparing', 'ready', 'completed', 'cancelled'], preparing: ['ready', 'completed', 'cancelled'], ready: ['completed', 'cancelled'], completed: [], cancelled: [],
}
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const goodPassword = (v: string) => v.length >= 8 && v.length <= 72 && /[A-Za-z]/.test(v) && /\d/.test(v)

export async function demoApi<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  const body = (init.json ?? {}) as Record<string, unknown>
  const form = init.body instanceof FormData ? init.body : null
  const db = await load()
  const route = path.split('?')[0]
  const seg = route.split('/').filter(Boolean)
  const is = (m: string, pattern: string) => method === m && new RegExp('^' + pattern.replace(/:id/g, '[^/]+') + '$').test(route)
  const out = <R>(v: R): T => { save(); return structuredClone(v) as unknown as T }
  const none = (): T => { save(); return undefined as T }

  // ---- public content
  if (is('GET', '/site')) return out(db.site)
  if (is('GET', '/menu')) return out(db.products.filter((p) => p.available).sort((a, b) => a.sortOrder - b.sortOrder))

  // ---- accounts
  if (is('GET', '/auth/session')) { const u = db.users.find((x) => x.id === db.session && !x.blocked); return out({ user: u ? pub(u) : null }) }
  if (is('POST', '/auth/login')) {
    const u = db.users.find((x) => x.email === str(body.email).toLowerCase())
    if (!u || !(await checkPw(String(body.password ?? ''), u.pw))) return fail(401, 'Email or password is incorrect.')
    if (u.blocked) fail(403, 'This account has been blocked. Please contact the café.')
    db.session = u.id
    return out(pub(u))
  }
  if (is('POST', '/auth/register')) {
    const name = str(body.name), email = str(body.email).toLowerCase(), phone = str(body.phone), password = String(body.password ?? '')
    if (name.length < 2 || !NAME.test(name)) fail(400, 'Enter your full name.', 'name')
    if (!EMAIL.test(email)) fail(400, 'Enter a valid email address.', 'email')
    if (!PHONE.test(phone)) fail(400, 'Enter a valid phone number, for example 077 123 4567.', 'phone')
    if (!goodPassword(password)) fail(400, 'Password must be at least 8 characters, with letters and numbers.', 'password')
    if (db.users.some((x) => x.email === email)) fail(409, 'An account with this email already exists.', 'email')
    const u: DUser = { id: uid(), name, email, phone, role: 'customer', avatar: null, createdAt: now(), blocked: false, pw: await makePw(password) }
    db.users.push(u); db.session = u.id
    return out(pub(u))
  }
  if (is('POST', '/auth/logout')) { db.session = null; return none() }
  if (is('PATCH', '/auth/me')) {
    const u = me(db), name = str(body.name), phone = str(body.phone)
    if (name.length < 2 || !NAME.test(name)) fail(400, 'Enter your full name.', 'name')
    if (!PHONE.test(phone)) fail(400, 'Enter a valid phone number, for example 077 123 4567.', 'phone')
    u.name = name; u.phone = phone
    return out(pub(u))
  }
  if (is('POST', '/auth/me/avatar')) { const u = me(db); u.avatar = await photo(form?.get('file'), 320); return out(pub(u)) }
  if (is('DELETE', '/auth/me/avatar')) { const u = me(db); u.avatar = null; return out(pub(u)) }
  if (is('POST', '/auth/password')) {
    const u = me(db)
    if (!(await checkPw(String(body.currentPassword ?? ''), u.pw))) fail(401, 'Your current password is incorrect.', 'currentPassword')
    if (!goodPassword(String(body.newPassword ?? ''))) fail(400, 'Password must be at least 8 characters, with letters and numbers.', 'newPassword')
    u.pw = await makePw(String(body.newPassword))
    return none()
  }
  if (is('POST', '/auth/forgot-password')) {
    const u = db.users.find((x) => x.email === str(body.email).toLowerCase() && x.role === 'customer' && !x.blocked)
    if (u && !db.resets.some((r) => r.userId === u.id && !r.token)) db.resets.push({ id: uid(), userId: u.id, createdAt: now() })
    return out({ emailed: false })
  }
  if (is('POST', '/auth/reset-password')) {
    const r = db.resets.find((x) => x.token && x.token === body.token)
    if (!r || (r.expiresAt ?? 0) < Date.now()) return fail(400, 'This reset link is invalid or has expired. Please request a new one.')
    if (!goodPassword(String(body.password ?? ''))) fail(400, 'Password must be at least 8 characters, with letters and numbers.', 'password')
    const u = db.users.find((x) => x.id === r.userId)
    if (u) { u.pw = await makePw(String(body.password)); if (db.session === u.id) db.session = null }
    db.resets = db.resets.filter((x) => x.userId !== r.userId)
    return none()
  }
  if (route.startsWith('/auth/admin-reset')) fail(503, 'Text-message codes need the full café server. On this demo, sign in with the demo password shown above.')

  // ---- customers: orders, bookings, newsletter
  if (is('POST', '/orders')) {
    const u = me(db)
    const items = (Array.isArray(body.items) ? body.items : []) as { productId: string; quantity: number }[]
    if (!items.length) fail(400, 'Your cart is empty.')
    const lines = items.map((i) => {
      const p = db.products.find((x) => x.id === i.productId)
      if (!p) return fail(400, 'A drink in your cart is no longer on the menu. Please remove it and try again.')
      if (!p.available) fail(400, `${p.name} is not available right now. Please remove it and try again.`)
      if (!Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 20) fail(400, 'You can order 1 to 20 of one drink.')
      return { productId: p.id, name: p.name, price: p.price, quantity: i.quantity }
    })
    const type = body.type === 'delivery' ? 'delivery' : 'pickup', phone = str(body.phone), address = str(body.address)
    if (!PHONE.test(phone)) fail(400, 'Enter a valid phone number, for example 077 123 4567.', 'phone')
    if (type === 'delivery' && (address.length < 10 || address.length > 200)) fail(400, 'Enter your full delivery address (10 to 200 characters).', 'address')
    const o: DOrder = {
      id: uid(), number: db.nextOrder++, userId: u.id, items: lines, total: Math.round(lines.reduce((s, x) => s + x.price * x.quantity, 0) * 100) / 100,
      status: 'pending', type, phone, address: type === 'delivery' ? address : '', note: str(body.note).slice(0, 300), createdAt: now(),
    }
    db.orders.unshift(o)
    return out(orderOut(db, o))
  }
  if (is('GET', '/orders/mine')) { const u = me(db); return out(db.orders.filter((o) => o.userId === u.id).map((o) => orderOut(db, o))) }
  if (is('POST', '/orders/:id/cancel')) {
    const u = me(db), o = db.orders.find((x) => x.id === seg[1] && x.userId === u.id)
    if (!o) return fail(404, 'Order not found.')
    if (o.status !== 'pending') fail(403, 'This order is already being prepared and can no longer be cancelled.')
    o.status = 'cancelled'
    return out(orderOut(db, o))
  }
  if (is('POST', '/reservations')) {
    const name = str(body.name), phone = str(body.phone), email = str(body.email).toLowerCase(), date = str(body.date), time = str(body.time), guests = Number(body.guests)
    if (name.length < 2) fail(400, 'Enter your name.', 'name')
    if (!PHONE.test(phone)) fail(400, 'Enter a valid phone number, for example 077 123 4567.', 'phone')
    if (!EMAIL.test(email)) fail(400, 'Enter a valid email address.', 'email')
    if (!date || date < day(0)) fail(400, 'Choose today or a later date.', 'date')
    if (date > day(60)) fail(400, 'Reservations open up to 60 days ahead.', 'date')
    if (time < '07:00' || time > '22:00') fail(400, 'Choose a time between 07:00 and 22:00.', 'time')
    if (!Number.isInteger(guests) || guests < 1 || guests > 12) fail(400, 'Choose 1 to 12 guests.', 'guests')
    const r: Reservation = { id: uid(), name, phone, email, date, time, guests, note: str(body.note).slice(0, 300), status: 'requested', createdAt: now() }
    db.reservations.push(r)
    return out({ id: r.id, date, time, guests })
  }
  if (is('POST', '/newsletter')) {
    const email = str(body.email).toLowerCase()
    if (!EMAIL.test(email)) fail(400, 'Enter a valid email address.', 'email')
    if (!db.subscribers.some((s) => s.email === email)) db.subscribers.unshift({ id: uid(), email, createdAt: now() })
    return out({ ok: true })
  }

  // ---- admin (everything below needs the admin account)
  if (route.startsWith('/admin')) admin(db)
  if (is('GET', '/admin/stats')) {
    const start = new Date(); start.setHours(0, 0, 0, 0)
    return out({
      ordersToday: db.orders.filter((o) => new Date(o.createdAt) >= start).length,
      openOrders: db.orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)).length,
      revenue: db.orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.total, 0),
      customers: db.users.filter((u) => u.role === 'customer').length,
      products: db.products.filter((p) => p.available).length,
    })
  }
  if (is('GET', '/admin/orders')) return out(db.orders.map((o) => orderOut(db, o)))
  if (is('PATCH', '/admin/orders/:id')) {
    const o = db.orders.find((x) => x.id === seg[2])
    if (!o) return fail(404, 'Order not found.')
    const s = body.status as OrderStatus
    if (o.status !== s && !NEXT[o.status].includes(s)) fail(400, `A ${o.status} order cannot be changed to ${s}.`)
    o.status = s
    return out(orderOut(db, o))
  }
  if (is('GET', '/admin/menu')) return out([...db.products].sort((a, b) => a.sortOrder - b.sortOrder))
  if (is('POST', '/admin/menu') || is('PATCH', '/admin/menu/:id')) {
    const name = str(body.name), price = Number(body.price)
    if (name.length < 2 || name.length > 60) fail(400, 'Drink name must be 2 to 60 characters.', 'name')
    if (!(price > 0) || price > 100000) fail(400, 'Price must be more than 0.', 'price')
    if (!str(body.image)) fail(400, 'Add a photo of the drink.', 'image')
    const category = (['hot', 'cold', 'beans'] as const).find((c) => c === body.category) ?? 'hot'
    const data = { name, description: str(body.description).slice(0, 200), price: Math.round(price * 100) / 100, category, image: str(body.image), available: !!body.available, featured: !!body.featured, sortOrder: Number(body.sortOrder) || 0 }
    if (method === 'POST') { const p: MenuItem = { id: uid(), ...data }; db.products.push(p); return out(p) }
    const p = db.products.find((x) => x.id === seg[2])
    if (!p) return fail(404, 'That drink no longer exists.')
    Object.assign(p, data)
    return out(p)
  }
  if (is('DELETE', '/admin/menu/:id')) { db.products = db.products.filter((x) => x.id !== seg[2]); return none() }
  if (is('POST', '/admin/images')) return out({ url: await photo(form?.get('file'), 900) })
  if (is('PUT', '/admin/site')) { db.site = structuredClone(body) as unknown as SiteContent; return out(db.site) }
  if (is('GET', '/admin/customers')) return out(db.users.map((u) => ({ ...pub(u), blocked: u.blocked, orders: db.orders.filter((o) => o.userId === u.id).length })).reverse())
  if (is('PATCH', '/admin/customers/:id') || is('DELETE', '/admin/customers/:id')) {
    const u = db.users.find((x) => x.id === seg[2])
    if (!u) return fail(404, 'Customer not found.')
    if (u.id === db.session) fail(400, 'You cannot change your own account here.')
    if (u.role === 'admin') fail(400, 'Admin accounts cannot be blocked or deleted here.')
    if (method === 'DELETE') { db.users = db.users.filter((x) => x.id !== u.id); db.orders = db.orders.filter((o) => o.userId !== u.id); return none() }
    u.blocked = !!body.blocked
    return out({ id: u.id, blocked: u.blocked })
  }
  if (is('GET', '/admin/password-resets')) {
    return out(db.resets.filter((r) => !r.token).flatMap((r) => {
      const u = db.users.find((x) => x.id === r.userId)
      return u ? [{ id: r.id, createdAt: r.createdAt, customer: { id: u.id, name: u.name, email: u.email, phone: u.phone } }] : []
    }))
  }
  if (is('POST', '/admin/password-resets/customers/:id/link')) {
    const u = db.users.find((x) => x.id === seg[3] && x.role === 'customer')
    if (!u) return fail(404, 'Customer not found.')
    const token = uid().replace(/-/g, '') + uid().replace(/-/g, ''), expiresAt = Date.now() + 60 * 60_000
    db.resets = db.resets.filter((r) => r.userId !== u.id)
    db.resets.push({ id: uid(), userId: u.id, token, expiresAt, createdAt: now() })
    return out({ url: `${location.origin}${location.pathname}#/reset-password?token=${token}`, expiresAt: new Date(expiresAt).toISOString() })
  }
  if (is('DELETE', '/admin/password-resets/:id')) { db.resets = db.resets.filter((r) => r.id !== seg[2] || r.token); return none() }
  if (is('GET', '/admin/reservations')) return out([...db.reservations].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)))
  if (is('PATCH', '/admin/reservations/:id')) {
    const r = db.reservations.find((x) => x.id === seg[2])
    if (!r) return fail(404, 'Reservation not found.')
    r.status = body.status as Reservation['status']
    return out(r)
  }
  if (is('GET', '/admin/subscribers')) return out(db.subscribers)
  if (is('DELETE', '/admin/subscribers/:id')) { db.subscribers = db.subscribers.filter((s) => s.id !== seg[2]); return none() }

  return fail(404, 'This action is not available in the demo.')
}
