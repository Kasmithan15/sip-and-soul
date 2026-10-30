import { useRef, type MouseEvent, type ReactNode } from 'react'

/** Tilts its child toward the cursor in 3D, with a soft light glare that follows the pointer. */
export function Tilt({ children, max = 12 }: { children: ReactNode; max?: number }) {
  const card = useRef<HTMLDivElement>(null)
  const glare = useRef<HTMLDivElement>(null)

  const onMove = (e: MouseEvent) => {
    const rect = card.current!.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    card.current!.style.transform = `rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateZ(10px)`
    glare.current!.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,.35), transparent 55%)`
    glare.current!.style.opacity = '1'
  }

  const onLeave = () => {
    card.current!.style.transform = ''
    glare.current!.style.opacity = '0'
  }

  return (
    <div className="[perspective:900px]" onMouseMove={onMove} onMouseLeave={onLeave}>
      <div ref={card} className="relative transition-transform duration-300 ease-out [transform-style:preserve-3d]">
        {children}
        <div ref={glare} className="pointer-events-none absolute inset-0 rounded-md opacity-0 mix-blend-soft-light transition-opacity duration-300" />
      </div>
    </div>
  )
}
