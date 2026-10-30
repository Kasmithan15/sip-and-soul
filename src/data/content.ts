// Unsplash photos, saved in public/images so the site works wherever it is hosted.
const photo = (id: string) => `images/${id}.jpg`

export interface Product {
  name: string
  price: number
  image: string
}

export interface Feature {
  icon: 'bean' | 'leaf' | 'truck' | 'shield'
  title: string
  text: string
}

export interface Stat {
  value: number
  suffix: string
  label: string
  decimals?: number
}

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Menu', href: '#menu' },
  { label: 'Shop', href: '#shop' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export const features: Feature[] = [
  { icon: 'bean', title: 'Premium Quality', text: 'The finest beans, carefully selected for the perfect taste.' },
  { icon: 'leaf', title: 'Freshly Brewed', text: 'Crafted with passion, served with love.' },
  { icon: 'truck', title: 'Fast & Reliable Delivery', text: 'Get your favorite coffee, right to your door.' },
  { icon: 'shield', title: 'Secure Payments', text: 'Shop with confidence and ease.' },
]

export const products: Product[] = [
  { name: 'Cappuccino', price: 4.5, image: photo('1572442388796-11668a67e53d') },
  { name: 'Iced Latte', price: 4, image: photo('1461023058943-07fcbe16d735') },
  { name: 'Espresso', price: 3, image: photo('1510591509098-f4fdc6d0ff04') },
  { name: 'Caramel Macchiato', price: 4.5, image: photo('1485808191679-5f86510681a2') },
]

export const stats: Stat[] = [
  { value: 10, suffix: 'K+', label: 'Happy Customers' },
  { value: 50, suffix: '+', label: 'Premium Coffee Blends' },
  { value: 100, suffix: '%', label: 'Fresh & Natural Beans' },
  { value: 4.9, suffix: '★', label: 'Customer Rating', decimals: 1 },
]

export const images = {
  heroBg: photo('1501339847302-ac426a4a7cbb'),
  story: photo('1447933601403-0c6688de566e'),
  ctaBg: photo('1559056199-641a0ac8b55e'),
}
