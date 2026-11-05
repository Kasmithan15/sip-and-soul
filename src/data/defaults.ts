import type { MenuItem, SiteContent } from '../lib/types'

// Shown until the server answers (and on copies of the site without a server, such as GitHub Pages).
export const defaultSite: SiteContent = {
  currency: '$',
  hero: {
    eyebrow: 'PREMIUM COFFEE • FRESHLY BREWED • ALWAYS',
    titleLine1: 'Elegance in',
    titleLine2: 'Every Sip.',
    text: 'Discover Sip & Soul Café — premium coffee, handcrafted beverages, and a cozy experience made for true coffee lovers.',
  },
  features: [
    { icon: 'bean', title: 'Premium Quality', text: 'The finest beans, carefully selected for the perfect taste.' },
    { icon: 'leaf', title: 'Freshly Brewed', text: 'Crafted with passion, served with love.' },
    { icon: 'truck', title: 'Fast & Reliable Delivery', text: 'Get your favorite coffee, right to your door.' },
    { icon: 'shield', title: 'Secure Payments', text: 'Shop with confidence and ease.' },
  ],
  menu: { eyebrow: 'OUR SIGNATURE', title: 'Coffee Favorites', text: 'From rich espressos to creamy lattes, our menu is crafted to bring out the best in every bean.' },
  story: {
    eyebrow: 'OUR STORY',
    title: 'More Than Just Coffee',
    text: 'Sip & Soul Café was born from a simple belief — that great coffee brings people together. We source the finest beans, craft every drink with care, and create a space where every cup feels special.',
    tagline: 'Elegance in Every Sip',
  },
  stats: [
    { value: 10, suffix: 'K+', label: 'Happy Customers', decimals: 0 },
    { value: 50, suffix: '+', label: 'Premium Coffee Blends', decimals: 0 },
    { value: 100, suffix: '%', label: 'Fresh & Natural Beans', decimals: 0 },
    { value: 4.9, suffix: '★', label: 'Customer Rating', decimals: 1 },
  ],
  cta: { eyebrow: 'READY FOR A BETTER COFFEE EXPERIENCE?', title: 'Your Perfect Cup Awaits' },
  contact: { phone: '+94 76 004 1594', email: 'info@neirahtech.com', address: '', hours: '' },
  reviews: [],
}

const item = (i: number, name: string, description: string, price: number, image: string, category: MenuItem['category'] = 'hot', featured = true): MenuItem =>
  ({ id: `local-${i}`, name, description, price, category, image: `images/${image}.jpg`, available: true, featured, sortOrder: i })

export const defaultMenu: MenuItem[] = [
  item(0, 'Cappuccino', 'Espresso, steamed milk and velvet foam.', 4.5, '1572442388796-11668a67e53d'),
  item(1, 'Iced Latte', 'Cold milk, ice and a double shot.', 4, '1461023058943-07fcbe16d735', 'cold'),
  item(2, 'Espresso', 'A short, rich double shot.', 3, '1510591509098-f4fdc6d0ff04'),
  item(3, 'Caramel Macchiato', 'Vanilla milk, espresso and caramel drizzle.', 4.5, '1485808191679-5f86510681a2'),
  item(4, 'Café Latte', 'Silky steamed milk poured over a double shot.', 4.5, '1509042239860-f550ce710b93', 'hot', false),
  item(5, 'Pour-Over', 'Single-origin beans, brewed by hand, one cup at a time.', 5, '1442512595331-e89e73853f31', 'hot', false),
  item(6, 'Cold Brew', 'Steeped for 18 hours. Smooth, chocolatey and low in acid.', 4.75, '1517701604599-bb29b565090c', 'cold', false),
  item(7, 'House Blend Beans · 250 g', 'Our signature medium roast. Whole beans, roasted this week.', 12, '1587734195503-904fca47e0e9', 'beans', false),
]
