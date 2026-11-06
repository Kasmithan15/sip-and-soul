import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import { gsap, useRichMotion, useScrollProgress } from './motion'
import { GrinderScene } from './three/GrinderScene'

export function HeroGrind() {
  const section = useRef<HTMLElement>(null)
  const rich = useRichMotion()
  const progress = useScrollProgress(section, { start: 'top top', end: 'bottom bottom', enabled: rich, still: 0 })
  const [opened, setOpened] = useState(false)
  const word = useRef<HTMLDivElement>(null)

  // Show the "Explore" tag once the grinder has come apart, and let the giant word drift.
  useEffect(() => {
    if (!rich) return
    let raf = 0
    const loop = () => {
      setOpened(progress.current > 0.45)
      if (word.current) word.current.style.transform = `translate(-50%, -50%) scale(${1 + progress.current * 0.18})`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [rich, progress])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-hero]', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', stagger: 0.12, delay: 0.2, clearProps: 'transform,opacity' })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section id="top" ref={section} aria-labelledby="grind-title" className={`relative ${rich ? 'h-[230vh]' : ''}`}>
      <div className={`${rich ? 'sticky top-0 h-svh' : 'relative pt-28 pb-10'} overflow-hidden`}>
        {/* the giant faded word */}
        <div
          ref={word}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[34vw] leading-none font-[900] tracking-tighter text-espresso/[.06] select-none md:text-[26vw]"
        >
          GRIND
        </div>
        {/* floating terracotta and cream spheres for depth */}
        <span aria-hidden className="absolute top-[18%] right-[8%] size-24 rounded-full bg-[radial-gradient(circle_at_35%_30%,#e08a63,#c0623b_55%,#8e4326)] shadow-[0_30px_60px_rgba(192,98,59,.35)] md:size-36" />
        <span aria-hidden className="absolute bottom-[14%] left-[46%] size-14 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fffaf4,#e8dccd_60%,#cdb9a4)] shadow-[0_20px_40px_rgba(43,29,22,.15)]" />

        <div className="relative mx-auto grid h-full max-w-7xl items-center gap-6 px-5 sm:px-8 md:grid-cols-[1fr_1.1fr]">
          <div className="z-10 max-w-md pt-16 md:pt-0">
            <p data-hero className="font-display text-[5.5rem] leading-none font-[900] text-terra md:text-[8rem]">1</p>
            <h1 id="grind-title" data-hero className="mt-2 font-display text-6xl leading-[.9] font-[900] tracking-tight text-espresso md:text-8xl">GRIND</h1>
            <p data-hero className="mt-6 text-[17px] leading-relaxed text-latte">
              Every cup at Sip &amp; Soul starts with whole beans, ground seconds before brewing. Fresh grounds keep the aromas that
              pre-ground coffee loses within minutes.
            </p>
            <div data-hero className="mt-8">
            <a href="#visit" className="inline-flex items-center gap-3 rounded-full bg-espresso px-7 py-4 text-[15px] font-semibold text-cream shadow-[0_14px_30px_rgba(43,29,22,.25)] transition hover:scale-[1.04]">
              Come here <span aria-hidden>→</span>
            </a>
            </div>
          </div>

          <div className={`relative ${rich ? 'h-full' : 'h-[62svh]'}`}>
            <span aria-hidden className="absolute bottom-[7%] left-1/2 h-10 w-[55%] -translate-x-1/2 rounded-[50%] bg-espresso/25 blur-2xl" />
            <Canvas shadows camera={{ position: [0, 1.2, 9], fov: 34 }} dpr={[1, 2]} aria-label="3D coffee grinder with beans falling into the hopper">
              <Suspense fallback={null}>
                <GrinderScene progress={progress} animateBeans={!window.matchMedia('(prefers-reduced-motion: reduce)').matches} />
              </Suspense>
            </Canvas>
            <a
              href="#find"
              className={`absolute top-[46%] right-[4%] flex items-center gap-2 rounded-full bg-cream/90 px-4 py-2 text-sm font-semibold text-espresso shadow-lg backdrop-blur transition-all duration-500 ${opened ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-4 opacity-0'}`}
            >
              <span className="size-2 rounded-full bg-terra" /> Explore the burrs
            </a>
          </div>
        </div>

        {rich && (
          <div aria-hidden className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-[.3em] text-latte">
            SCROLL
            <span className="h-10 w-px animate-pulse bg-latte/50" />
          </div>
        )}
      </div>
    </section>
  )
}
