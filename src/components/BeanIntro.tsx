import { Canvas } from '@react-three/fiber'
import { IntroScene } from '../three/IntroScene'

const TITLE = 'SIP & SOUL'

/** Full-screen landing with 3D beans; a click anywhere goes straight to the site. */
export function BeanIntro({ onEnter }: { onEnter: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Enter Sip & Soul Café"
      onClick={onEnter}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onEnter()}
      className="fixed inset-0 z-[60] cursor-pointer bg-[radial-gradient(ellipse_at_center,#6b4229_0%,#3a2418_55%,#24160e_100%)] outline-none"
    >
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        <IntroScene />
      </Canvas>

      {/* Title letters flip up one by one. */}
      <h1 className="pointer-events-none absolute inset-x-0 top-[9%] text-center font-serif text-[clamp(2rem,6vw,4rem)] tracking-[.25em] text-cream [perspective:900px]">
        {[...TITLE].map((ch, i) => (
          <span key={i} className="inline-block animate-letter-in opacity-0" style={{ animationDelay: `${0.2 + i * 0.06}s` }}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
        <span className="mt-3 block font-sans text-[11px] tracking-[.6em] text-gold">CAFÉ</span>
      </h1>

      
    </div>
  )
}
