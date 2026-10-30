import { Canvas } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import { images } from '../data/content'
import { BREW_MS, CUP_LAND_MS } from '../data/brew'
import { CoffeeScene } from '../three/CoffeeScene'
import { Button } from './Button'

const TITLE_LINES = ['Elegance in', 'Every Sip.']

export function Hero({ show }: { show: boolean }) {
  const [ready, setReady] = useState(false)
  // Drag-to-rotate would block page scrolling on touch screens.
  const finePointer = useMemo(() => window.matchMedia('(pointer: fine)').matches, [])

  useEffect(() => {
    if (!show) return
    const id = window.setTimeout(() => setReady(true), CUP_LAND_MS + BREW_MS)
    return () => window.clearTimeout(id)
  }, [show])

  // Each element flips up in 3D, staggered by `order`.
  const enter = (order: number) => ({
    transition: 'transform 1.1s cubic-bezier(.22,1,.36,1), opacity 1.1s cubic-bezier(.22,1,.36,1)',
    transitionDelay: `${0.3 + order * 0.12}s`,
    transformOrigin: '50% 100%',
    transform: show ? 'none' : 'perspective(800px) rotateX(-75deg) translateY(40px)',
    opacity: show ? 1 : 0,
  })

  return (
    <section
      id="home"
      className="relative isolate grid min-h-screen content-center gap-4 overflow-hidden px-4 pt-28 pb-10 text-cream sm:px-[7%] lg:grid-cols-[minmax(0,520px)_1fr] lg:pt-20"
    >
      {/* Warm café backdrop, blurred and darkened toward the text */}
      <div
        className="absolute inset-0 -z-20 scale-110 bg-cover bg-center blur-[5px] brightness-125"
        style={{ backgroundImage: `url(${images.heroBg})` }}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(43,26,16,.92)_22%,rgba(70,42,24,.62)_55%,rgba(110,68,36,.3)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_72%_55%,rgba(230,160,90,.38),transparent_62%)]" />

      <div className="z-10 mx-auto w-full max-w-[520px] text-center lg:mx-0 lg:text-left">
        <p style={enter(0)} className="mb-5 text-[11px] font-medium tracking-[.22em] text-gold">
          PREMIUM COFFEE • FRESHLY BREWED • ALWAYS
        </p>
        <h1 className="mb-6 font-serif text-[clamp(2.8rem,5.4vw,4.6rem)] leading-[1.05] font-normal">
          {TITLE_LINES.map((line, i) => (
            <span key={line} style={enter(1 + i)} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p style={enter(3)} className="mx-auto mb-9 max-w-[420px] leading-relaxed text-cream/85 lg:mx-0">
          Discover Sip &amp; Soul Café — premium coffee, handcrafted beverages, and a cozy experience made for true coffee
          lovers.
        </p>
        <div style={enter(4)} className="flex flex-wrap justify-center gap-4 lg:justify-start">
          <Button href="#menu" arrow>Order Now</Button>
          <Button href="#menu" variant="outline">Explore Menu</Button>
        </div>
      </div>

      {/* 3D cup on a wooden table: coffee spirals in and settles into a finished latte */}
      <div className="hero-canvas-fade relative -mx-4 h-[400px] sm:-mx-[7%] sm:h-[500px] lg:absolute lg:inset-y-0 lg:right-0 lg:mx-0 lg:h-auto lg:w-[58%]">
        <Canvas camera={{ position: [0, 4.1, 6.9], fov: 38 }} dpr={[1, 2]} shadows>
          <CoffeeScene show={show} interactive={finePointer} />
        </Canvas>

        {/* Brewing status */}
        <div
          className={`pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-md transition-opacity duration-1000 lg:bottom-10
            ${show ? 'opacity-100 delay-[1.5s]' : 'opacity-0'}`}
        >
          <span className={`size-2 rounded-full bg-gold ${ready ? '' : 'animate-pulse'}`} />
          <span key={String(ready)} className="animate-flip-in text-xs whitespace-nowrap text-cream/85">
            {ready ? 'Your cappuccino is ready' : 'Brewing your cappuccino…'}
          </span>
        </div>
      </div>
    </section>
  )
}
