import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export const BeanIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <ellipse cx="12" cy="12" rx="7" ry="10" transform="rotate(35 12 12)" />
    <path d="M8 18c3-3 5-9 8-12" />
  </svg>
)

/** Solid bean used in the logo. `lineColor` is the colour of the center crease. */
export const BeanSolid = ({ lineColor = '#1e120c', ...p }: IconProps & { lineColor?: string }) => (
  <svg viewBox="0 0 24 24" {...p}>
    <ellipse cx="12" cy="12" rx="7" ry="10" transform="rotate(35 12 12)" fill="currentColor" />
    <path d="M8 18c3-3 5-9 8-12" stroke={lineColor} strokeWidth="1.6" fill="none" />
  </svg>
)

export const LeafIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 19c0-8 6-14 15-15-1 9-7 15-15 15Z" />
    <path d="M5 19 14 10" />
  </svg>
)

export const TruckIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M2 6h11v10H2zM13 9h4l4 4v3h-8" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
)

export const ShieldIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export const SearchIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
)

export const UserIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
)

export const CartIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6" />
    <circle cx="9" cy="20" r="1.3" />
    <circle cx="17" cy="20" r="1.3" />
  </svg>
)

export const PhoneIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
)

export const MailIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)

export const InstagramIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".8" />
  </svg>
)

export const FacebookIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M13 21v-8h3l.5-3H13V8.5c0-1 .4-1.5 1.5-1.5H17V4.3A20 20 0 0 0 14.5 4C12 4 10 5.5 10 8.2V10H7v3h3v8" />
  </svg>
)

export const XIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 4l16 16M20 4 4 20" />
  </svg>
)

export const YoutubeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="2" y="5" width="20" height="14" rx="4" />
    <path d="m10 9 5 3-5 3Z" />
  </svg>
)

export const LeafOutline = (p: IconProps) => (
  <svg viewBox="0 0 100 200" fill="none" stroke="currentColor" strokeWidth="1" {...p}>
    <path d="M50 195C50 120 20 80 50 5c30 75 0 115 0 190Z" />
    <path d="M50 195V10" />
  </svg>
)
