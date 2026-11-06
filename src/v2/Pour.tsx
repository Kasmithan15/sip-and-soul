import { Canvas } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import { useRichMotion, useScrollProgress } from './motion'
import { PourScene } from './three/PourScene'

export function Pour() {
  const section = useRef<HTMLElement>(null)
  const rich = useRichMotion()
  const progress = useScrollProgress(section, { start: 'top top', end: 'bottom bottom', enabled: rich, still: 0.6 })

  return (
    <section id="pour" ref={section} aria-labelledby="pour-title" className={`relative bg-cream ${rich ? 'h-[240vh]' : 'py-20'}`}>
      <div className={`${rich ? 'sticky top-0 h-svh' : 'relative'} overflow-hidden`}>
        <div className="relative mx-auto h-full max-w-7xl px-5 sm:px-8">
          {/* terracotta arch behind the counter */}
          <div aria-hidden className="absolute bottom-[10%] left-1/2 h-[52%] w-[min(560px,78vw)] md:h-[70%] -translate-x-1/2 rounded-t-full bg-[linear-gradient(180deg,#cf7449,#c0623b_45%,#a9512f)] shadow-[inset_0_-40px_80px_rgba(0,0,0,.12)]" />
          {/* the huge cream word across the scene */}
          <div aria-hidden className="pointer-events-none absolute top-[40%] left-1/2 z-10 md:top-[14%] -translate-x-1/2 font-display text-[30vw] leading-none font-[900] tracking-tighter text-cream mix-blend-normal drop-shadow-[0_20px_40px_rgba(43,29,22,.12)] select-none md:text-[22vw]">
            POUR
          </div>
          <div className="relative z-30 max-w-xs pt-4 md:absolute md:top-1/3 md:left-8 md:pt-0">
            <p data-reveal className="font-display text-6xl leading-none font-[900] text-terra">2.</p>
            <h2 id="pour-title" data-reveal className="mt-1 font-display text-5xl font-[900] tracking-tight md:text-6xl">POUR</h2>
            <p data-reveal className="mt-4 text-[16px] leading-relaxed text-latte">
              Water just off the boil, poured slowly in circles. Every pour-over is brewed by hand, one cup at a time.
            </p>
          </div>
          <div className={`z-20 ${rich ? 'absolute inset-y-0 left-1/2 w-screen -translate-x-1/2' : 'relative -mx-5 h-[70svh]'}`}>
            <Canvas shadows camera={{ position: [0, 1.1, 8.5], fov: 36 }} dpr={[1, 2]} aria-label="A kettle pouring water into a pour-over dripper above a glass carafe">
              <Suspense fallback={null}><PourScene progress={progress} /></Suspense>
            </Canvas>
            {/* steam above the carafe */}
            <div aria-hidden className="pointer-events-none absolute top-[38%] left-1/2 flex -translate-x-1/2 gap-3">
              {[0, 1, 2].map((i) => <span key={i} className="block h-24 w-3 animate-steam rounded-full bg-white/50 blur-md" style={{ animationDelay: `${i * 0.9}s` }} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
