import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect, useRef, useState } from 'react'

gsap.registerPlugin(ScrollTrigger)
export { gsap, ScrollTrigger }

const reduceQuery = '(prefers-reduced-motion: reduce)'
const desktopQuery = '(min-width: 768px)'

/** Full scroll-linked animation only on larger screens for visitors who haven't asked for less motion. */
export function useRichMotion() {
  const get = () => !window.matchMedia(reduceQuery).matches && window.matchMedia(desktopQuery).matches
  const [rich, setRich] = useState(get)
  useEffect(() => {
    const update = () => setRich(get())
    const a = window.matchMedia(reduceQuery), b = window.matchMedia(desktopQuery)
    a.addEventListener('change', update); b.addEventListener('change', update)
    return () => { a.removeEventListener('change', update); b.removeEventListener('change', update) }
  }, [])
  return rich
}

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia(reduceQuery).matches) return
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    // In-page links (#menu, #visit…) glide instead of jumping.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      const id = a?.getAttribute('href')
      if (!id || id.startsWith('#/') || id === '#') return
      const el = document.querySelector(id)
      if (el) { e.preventDefault(); lenis.scrollTo(el as HTMLElement, { offset: -70 }) }
    }
    document.addEventListener('click', onClick)
    return () => { document.removeEventListener('click', onClick); gsap.ticker.remove(tick); lenis.destroy() }
  }, [])
}

/** A number from 0 to 1 that follows how far a section has been scrolled, for the 3D scenes to read every frame. */
/** True when the visitor has asked their device for less motion. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia(reduceQuery).matches)
  useEffect(() => {
    const mq = window.matchMedia(reduceQuery), on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/**
 * A number from 0 to 1 that the 3D scenes read every frame.
 * - Desktop (`enabled`): follows the scroll through the pinned section (`start` → `end`).
 * - Phones: follows the section as it passes through the screen (`mobileStart` → `mobileEnd`), no pinning,
 *   so the phone layout stays the same but the scene still plays.
 * - Reduced motion: rests at `still`.
 */
export function useScrollProgress(target: React.RefObject<HTMLElement | null>, opts: { start?: string; end?: string; pin?: boolean; enabled?: boolean; still?: number; mobileStart?: string; mobileEnd?: string }) {
  const progress = useRef(0)
  const reduced = useReducedMotion()
  const { start = 'top top', end = 'bottom bottom', pin = false, enabled = true, still = 1, mobileStart = 'top 70%', mobileEnd = 'bottom 40%' } = opts
  useEffect(() => {
    if (!target.current) return
    if (reduced) { progress.current = still; return }
    const st = ScrollTrigger.create({
      trigger: target.current,
      start: enabled ? start : mobileStart,
      end: enabled ? end : mobileEnd,
      pin: enabled && pin,
      scrub: true,
      onUpdate: (self) => { progress.current = self.progress },
    })
    progress.current = st.progress
    return () => st.kill()
  }, [target, start, end, pin, enabled, still, mobileStart, mobileEnd, reduced])
  return progress
}

/** Fade-and-rise for elements marked data-reveal when they scroll into view (used on every screen size). */
export function useReveals(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!root.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: Number(el.dataset.reveal) || 0, clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 88%' } })
      })
    }, root)
    if (window.matchMedia(reduceQuery).matches) gsap.globalTimeline.progress(1)
    return () => ctx.revert()
  }, [root])
}
