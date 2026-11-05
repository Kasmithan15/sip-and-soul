import { useRef } from 'react'
import { Panels } from '../components/shop/Panels'
import { CupSection } from './CupSection'
import { HeroGrind } from './HeroGrind'
import { OrderReserve, OurStory, Recipes, ReviewsGallery, SiteFooter, VisitUs } from './Info'
import { FindYourCup, MenuSection } from './Shop'
import { Pour } from './Pour'
import { useReveals, useSmoothScroll } from './motion'
import { ChatButton, Nav } from './Nav'

/** The bean-to-cup homepage. */
export function Home() {
  const root = useRef<HTMLDivElement>(null)
  useSmoothScroll()
  useReveals(root)
  return (
    <div ref={root} className="bg-cream text-espresso">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-full focus:bg-espresso focus:px-4 focus:py-2 focus:text-cream">Skip to content</a>
      <Nav />
      <main id="main">
        <HeroGrind />
        <Pour />
        <CupSection />
        <FindYourCup />
        <MenuSection />
        <Recipes />
        <OurStory />
        <VisitUs />
        <ReviewsGallery />
        <OrderReserve />
      </main>
      <SiteFooter />
      <ChatButton />
      <Panels />
    </div>
  )
}
