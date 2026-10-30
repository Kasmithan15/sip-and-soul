import { BeanSolid } from './Icons'

export function Logo({ small }: { small?: boolean }) {
  return (
    <a href="#home" className="group grid justify-items-center leading-none text-cream">
      <BeanSolid className="mb-1.5 size-[22px] transition-transform duration-700 ease-smooth group-hover:rotate-180" />
      <span className={`font-serif tracking-[.22em] ${small ? 'text-[17px]' : 'text-[22px]'}`}>SIP &amp; SOUL</span>
      <span className="mt-1.5 text-[9px] tracking-[.4em] opacity-85">CAFÉ</span>
    </a>
  )
}
