import type { ReactNode } from 'react'
import { useInView } from '../hooks/useInView'

type Direction = 'up' | 'left' | 'right'

// Each direction swings in on a 3D hinge rather than just sliding.
const hidden: Record<Direction, string> = {
  up: 'perspective(1200px) rotateX(28deg) translateY(60px)',
  left: 'perspective(1200px) rotateY(30deg) translateX(-80px)',
  right: 'perspective(1200px) rotateY(-30deg) translateX(80px)',
}
const origin: Record<Direction, string> = {
  up: '50% 100%',
  left: '0% 50%',
  right: '100% 50%',
}

interface RevealProps {
  children: ReactNode
  direction?: Direction
  /** Delay in seconds, used to stagger siblings. */
  delay?: number
  className?: string
}

/** Swings its children into place in 3D when they scroll into view. */
export function Reveal({ children, direction = 'up', delay = 0, className = '' }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}s`,
        transformOrigin: origin[direction],
        transform: inView ? 'none' : hidden[direction],
        opacity: inView ? 1 : 0,
      }}
      className={`transition-[transform,opacity] duration-[1200ms] ease-smooth ${className}`}
    >
      {children}
    </div>
  )
}
