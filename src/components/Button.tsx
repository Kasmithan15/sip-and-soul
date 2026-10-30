import type { ReactNode } from 'react'

type Variant = 'gold' | 'outline' | 'dark'

const variants: Record<Variant, string> = {
  gold: 'bg-gold text-roast before:bg-cream',
  outline: 'border border-cream/70 text-cream before:bg-cream hover:text-roast',
  dark: 'bg-roast text-cream before:bg-gold hover:text-roast',
}

interface ButtonProps {
  children: ReactNode
  href?: string
  variant?: Variant
  small?: boolean
  arrow?: boolean
  className?: string
}

/** Pill link with a colour wipe and a sliding arrow on hover. */
export function Button({ children, href = '#', variant = 'gold', small, arrow, className = '' }: ButtonProps) {
  return (
    <a
      href={href}
      className={`group relative isolate inline-flex items-center gap-2.5 overflow-hidden rounded-full font-medium
        transition-all duration-500 ease-smooth hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,.25)]
        before:absolute before:inset-0 before:-z-10 before:-translate-x-full before:transition-transform before:duration-500
        before:ease-smooth hover:before:translate-x-0
        ${small ? 'px-5 py-2.5 text-[13px]' : 'px-7 py-3.5 text-[15px]'} ${variants[variant]} ${className}`}
    >
      {children}
      {arrow && <span className="transition-transform duration-500 ease-smooth group-hover:translate-x-1.5">→</span>}
    </a>
  )
}
