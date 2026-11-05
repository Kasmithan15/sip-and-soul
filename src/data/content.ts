// Unsplash photos, saved in public/images so the site works wherever it is hosted.
const photo = (id: string) => `images/${id}.jpg`

// Menu, prices and all section text now come from the admin panel (see data/defaults.ts for the built-in copy).

/** Neirah Tech, the company that built and runs this site (same details as the SecureView CCTV project). */
export const company = {
  name: 'Neirah Tech',
  phone: '+94 76 004 1594',
  phoneHref: 'tel:+94760041594',
  email: 'info@neirahtech.com',
  website: 'https://neirahtech.com',
  websiteLabel: 'neirahtech.com',
}

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Menu', href: '#menu' },
  { label: 'Shop', href: '#shop' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export const images = {
  heroBg: photo('1501339847302-ac426a4a7cbb'),
  story: photo('1447933601403-0c6688de566e'),
  ctaBg: photo('1559056199-641a0ac8b55e'),
}
