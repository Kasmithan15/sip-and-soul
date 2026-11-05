/** The website text as it was before the admin panel, used until an admin saves changes. */
export const siteDefaults = {
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
  menu: {
    eyebrow: 'OUR SIGNATURE',
    title: 'Coffee Favorites',
    text: 'From rich espressos to creamy lattes, our menu is crafted to bring out the best in every bean.',
  },
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
  contact: {
    phone: '+94 76 004 1594',
    email: 'info@neirahtech.com',
    address: '',
    hours: '',
  },
  // Real guest reviews, added by the admin. The section stays hidden while this is empty.
  reviews: [] as { name: string; text: string; rating: number }[],
};

export type SiteContent = typeof siteDefaults;

export const defaultProducts = [
  { name: 'Cappuccino', description: 'Espresso, steamed milk and velvet foam.', price: 4.5, category: 'hot' as const, image: 'images/1572442388796-11668a67e53d.jpg', sortOrder: 0 },
  { name: 'Iced Latte', description: 'Cold milk, ice and a double shot.', price: 4, category: 'cold' as const, image: 'images/1461023058943-07fcbe16d735.jpg', sortOrder: 1 },
  { name: 'Espresso', description: 'A short, rich double shot.', price: 3, category: 'hot' as const, image: 'images/1510591509098-f4fdc6d0ff04.jpg', sortOrder: 2 },
  { name: 'Caramel Macchiato', description: 'Vanilla milk, espresso and caramel drizzle.', price: 4.5, category: 'hot' as const, image: 'images/1485808191679-5f86510681a2.jpg', sortOrder: 3 },
];
