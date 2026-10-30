import { images } from '../data/content'
import { Button } from './Button'
import { BeanSolid, LeafOutline } from './Icons'
import { Reveal } from './Reveal'

export function Story() {
  return (
    <section id="about" className="grid overflow-hidden md:grid-cols-2 lg:min-h-[420px] lg:grid-cols-[1fr_1.13fr_.95fr]">
      <Reveal direction="left" className="group h-[300px] overflow-hidden md:h-auto">
        <img
          src={images.story}
          alt="Coffee beans and cup"
          loading="lazy"
          className="size-full object-cover transition-transform duration-[1500ms] ease-smooth group-hover:scale-108"
        />
      </Reveal>

      <Reveal className="flex flex-col justify-center bg-brown px-6 py-12 text-cream sm:px-14 sm:py-16">
        <p className="mb-4 text-[11px] font-medium tracking-[.22em] text-gold">OUR STORY</p>
        <h2 className="mb-6 font-serif text-[clamp(1.8rem,2.6vw,2.3rem)] leading-tight font-normal">More Than Just Coffee</h2>
        <p className="mb-8 max-w-[380px] text-sm leading-loose opacity-90">
          Sip &amp; Soul Café was born from a simple belief — that great coffee brings people together. We source the finest beans,
          craft every drink with care, and create a space where every cup feels special.
        </p>
        <Button small arrow className="self-start">Learn More</Button>
      </Reveal>

      <Reveal
        direction="right"
        delay={0.15}
        className="relative flex flex-col items-center justify-center overflow-hidden bg-cream px-6 py-14 text-roast md:col-span-2 lg:col-span-1"
      >
        <LeafOutline className="absolute -top-8 -right-8 h-[280px] w-[140px] rotate-30 animate-sway text-[#c9b49b] opacity-50" />
        <LeafOutline className="absolute right-2.5 -bottom-16 h-[280px] w-[140px] -rotate-20 animate-sway text-[#c9b49b] opacity-50 [animation-direction:reverse] [animation-duration:9s]" />
        <BeanSolid lineColor="#f3ece3" className="mb-4 size-11 animate-wobble" />
        <h3 className="font-serif whitespace-nowrap text-[clamp(1.6rem,2.6vw,2.2rem)] font-normal tracking-[.15em]">SIP &amp; SOUL</h3>
        <span className="mt-1.5 mb-6 text-[13px] tracking-[.4em]">CAFÉ</span>
        <p className="font-script text-[2.1rem] text-mocha">Elegance in Every Sip</p>
      </Reveal>
    </section>
  )
}
