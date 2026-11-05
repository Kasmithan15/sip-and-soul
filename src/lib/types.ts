export interface User { id: string; name: string; email: string; phone: string; role: 'customer' | 'admin'; createdAt: string }

export interface MenuItem { id: string; name: string; description: string; price: number; image: string; available: boolean; featured: boolean; sortOrder: number }

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
export interface OrderLine { productId: string; name: string; price: number; quantity: number }
export interface Order {
  id: string; number: number; items: OrderLine[]; total: number; status: OrderStatus; type: 'pickup' | 'delivery'
  phone: string; address: string; note: string; createdAt: string; user?: { name: string; email: string }
}

export interface SiteContent {
  currency: string
  hero: { eyebrow: string; titleLine1: string; titleLine2: string; text: string }
  features: { icon: 'bean' | 'leaf' | 'truck' | 'shield'; title: string; text: string }[]
  menu: { eyebrow: string; title: string; text: string }
  story: { eyebrow: string; title: string; text: string; tagline: string }
  stats: { value: number; suffix: string; label: string; decimals: number }[]
  cta: { eyebrow: string; title: string }
  contact: { phone: string; email: string; address: string; hours: string }
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Order received',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: 'bg-[#f4e7d3] text-[#7a5520]',
  preparing: 'bg-[#e8dcf4] text-[#5b3a86]',
  ready: 'bg-[#dcefe0] text-[#2d6a3a]',
  completed: 'bg-cream-2 text-latte',
  cancelled: 'bg-[#f6e1dc] text-[#8f3424]',
}
