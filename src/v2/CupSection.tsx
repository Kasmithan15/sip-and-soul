import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import { gsap, useRichMotion, useScrollProgress } from './motion'
import { CupScene } from './three/CupScene'

// Blurred coffee drops at three depths; nearer ones move faster for parallax.
const DROPS = [
  { x: 12, y: 20, s: 70, d: 1.6, blur: 10 }, { x: 80, y: 14, s: 110, d: 2.2, blur: 16 }, { x: 70, y: 70, s: 46, d: 1.2, blur: 4 },
  { x: 22, y: 76, s: 90, d: 2, blur: 12 }, { x: 88, y: 46, s: 30, d: 0.8, blur: 2 }, { x: 6, y: 50, s: 26, d: 0.7, blur: 1 },
  { x: 40, y: 8, s: 22, d: 0.9, blur: 3 }, { x: 58, y: 88, s: 60, d: 1.4, blur: 8 },
]

export function CupSection() {
  const section = useRef<HTMLElement>(null)
  const rich = useRichMotion()
  const progress = useScrollProgress(section, { start: 'top top', end: 'bottom bottom', enabled: rich })

  useEffect(() => {
    if (!rich || !section.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-drop]').forEach((el) => {
        gsap.to(el, { yPercent: -120 * Number(el.dataset.drop), ease: 'none', scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
      gsap.fromTo('[data-cup-title]', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: section.current, start: 'top 60%', end: 'top top', scrub: true } })
    }, section)
    return () => ctx.revert()
  }, [rich])

  return (
    <section ref={section} aria-labelledby="cup-title" className={`relative bg-[radial-gradient(ellipse_at_50%_60%,#f7efe6,#efe2d3_60%,#e6d4c1)] ${rich ? 'h-[220vh]' : 'py-20'}`}>
      <div className={`${rich ? 'sticky top-0 h-svh' : 'relative'} overflow-hidden`}>
        {DROPS.map((d, i) => (
          <span
            key={i}
            aria-hidden
            data-drop={d.d}
            className="absolute rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-[radial-gradient(circle_at_35%_30%,#8a5534,#3b1c0c_70%)]"
            style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s * 1.15, filter: `blur(${d.blur}px)`, opacity: 0.85 }}
          />
        ))}
        <div className="relative z-10 mx-auto max-w-3xl px-5 pt-28 text-center">
          <p data-reveal className="font-display text-6xl leading-none font-[900] text-terra">3.</p>
          <h2 id="cup-title" data-cup-title className="mt-2 font-display text-5xl leading-[.95] font-[900] tracking-tight md:text-7xl">INTO YOUR CUP</h2>
          <p data-reveal className="mx-auto mt-4 max-w-md text-latte">Ground fresh, poured slow, served warm. This is what we've been brewing toward.</p>
        </div>
        <div className={`${rich ? 'absolute inset-0 top-[12%]' : 'relative h-[60svh]'} [mask-image:linear-gradient(to_bottom,transparent,#000_30%)]`}>
          <Canvas shadows camera={{ position: [0, 1.4, 8.6], fov: 36 }} dpr={[1, 2]} aria-label="Coffee swirling down like a funnel into a white ceramic cup">
            <Suspense fallback={null}><CupScene progress={progress} /></Suspense>
          </Canvas>
        </div>
      </div>
    </section>
  )
}
