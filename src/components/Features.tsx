import type { SiteContent } from '../lib/types'
import { useStore } from '../state/store'
import { BeanIcon, LeafIcon, ShieldIcon, TruckIcon } from './Icons'
import { Reveal } from './Reveal'

const icons: Record<SiteContent['features'][number]['icon'], typeof BeanIcon> = {
  bean: BeanIcon,
  leaf: LeafIcon,
  truck: TruckIcon,
  shield: ShieldIcon,
}

export function Features() {
  const { features } = useStore().site
  return (
    <section id="features" className="grid grid-cols-2 gap-y-10 bg-cream px-4 py-16 sm:px-[7%] lg:grid-cols-4">
      {features.map((f, i) => {
        const Icon = icons[f.icon]
        return (
          <Reveal
            key={i}
            delay={i * 0.12}
            className={`group px-3 text-center lg:px-6 ${i % 2 === 0 ? 'border-r border-line' : ''} ${i === 1 ? 'lg:border-r lg:border-line' : ''}`}
          >
            <Icon className="mx-auto mb-4 size-8 text-roast transition-transform duration-700 ease-smooth group-hover:-translate-y-1.5 group-hover:-rotate-10 group-hover:scale-115" />
            <h3 className="mb-3 font-serif text-[17px] font-medium text-roast">{f.title}</h3>
            <p className="mx-auto max-w-[190px] text-[13px] leading-relaxed text-latte">{f.text}</p>
          </Reveal>
        )
      })}
    </section>
  )
}
