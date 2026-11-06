/** The Sip & Soul mark: a terracotta arch framing a cup with a heart of steam. */
export function ArchMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 140" width={size * (120 / 140)} height={size} aria-hidden className={className}>
      <path d="M10 138V60a50 50 0 0 1 100 0v78Z" fill="#c0623b" />
      <path d="M34 92h52v6a18 18 0 0 1-18 18H52a18 18 0 0 1-18-18Z" fill="#f3eae0" />
      <path d="M86 96h5a7 7 0 0 1 0 14h-7" fill="none" stroke="#f3eae0" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 82c-10-7-16-12-16-19a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 7-6 12-16 19Z" fill="#f3eae0" />
      <rect x="22" y="122" width="76" height="4" rx="2" fill="#f3eae0" opacity=".8" />
    </svg>
  )
}

/** Full logo: arch mark + italic "Sip & Soul" + CAFÉ. `light` is for dark backgrounds. */
export function Logo({ light, size = 'md', href = '#top' }: { light?: boolean; size?: 'sm' | 'md' | 'lg'; href?: string }) {
  const s = { sm: { mark: 30, name: 'text-[22px]', cafe: 'text-[8px]' }, md: { mark: 38, name: 'text-[27px]', cafe: 'text-[9px]' }, lg: { mark: 56, name: 'text-[40px]', cafe: 'text-[11px]' } }[size]
  return (
    <a href={href} aria-label="Sip & Soul Café, home" className={`group inline-flex items-center gap-2.5 ${light ? 'text-cream' : 'text-espresso'}`}>
      <ArchMark size={s.mark} className="transition-transform duration-500 group-hover:-translate-y-0.5" />
      <span className="leading-none">
        <span className={`block font-display ${s.name} font-[800] italic tracking-tight`}>Sip &amp; Soul</span>
        <span className={`mt-1 block ${s.cafe} font-semibold tracking-[.55em] ${light ? 'text-gold' : 'text-terra'}`}>CAFÉ</span>
      </span>
    </a>
  )
}
