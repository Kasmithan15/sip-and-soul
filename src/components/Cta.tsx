import { useEffect, useRef, useState } from 'react'
import { images } from '../data/content'
import { useStore } from '../state/store'
import { Button } from './Button'
import { Reveal } from './Reveal'

export function Cta() {
  const { site, openPanel } = useStore()
  const ref = useRef<HTMLElement>(null)
  const [offset, setOffset] = useState(0)

  // Background drifts slower than the page for a parallax effect.
  useEffect(() => {
    const onScroll = () => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return
      setOffset(((rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight) * 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      ref={ref}
      id="shop"
      className="relative isolate flex flex-col items-start gap-6 overflow-hidden px-6 py-14 text-cream sm:px-[10%] md:flex-row md:items-center md:justify-between"
    >
      <div
        className="absolute inset-x-0 -inset-y-[20%] -z-10 bg-cover bg-center will-change-transform"
        style={{
          transform: `translateY(${offset}px)`,
          backgroundImage: `linear-gradient(90deg, rgba(30,18,12,.97) 30%, rgba(30,18,12,.55)), url(${images.ctaBg})`,
        }}
      />
      <Reveal>
        <p className="mb-3 text-[10px] font-medium tracking-[.22em]">{site.cta.eyebrow}</p>
        <h2 className="max-w-[14ch] font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight font-normal">
          {site.cta.title}
        </h2>
      </Reveal>
      <Reveal delay={0.15}>
        <Button small arrow onClick={() => openPanel('menu')}>Shop Now</Button>
      </Reveal>
    </section>
  )
}
