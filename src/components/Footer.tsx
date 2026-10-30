import { navLinks } from '../data/content'
import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from './Icons'
import { Logo } from './Logo'

const socials = [
  { label: 'Instagram', Icon: InstagramIcon },
  { label: 'Facebook', Icon: FacebookIcon },
  { label: 'X', Icon: XIcon },
  { label: 'YouTube', Icon: YoutubeIcon },
]

const year = new Date().getFullYear()

export function Footer() {
  return (
    <footer id="contact" className="bg-espresso px-6 pt-10 pb-6 text-cream sm:px-[10%]">
      <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
        <Logo small />
        <nav className="flex flex-wrap justify-center gap-x-9 gap-y-3 text-[13px]">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="opacity-85 transition hover:text-gold hover:opacity-100">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex gap-5">
          {socials.map(({ label, Icon }) => (
            <a key={label} href="#" aria-label={label} className="opacity-85 transition hover:-translate-y-1 hover:text-gold hover:opacity-100">
              <Icon className="size-[18px]" />
            </a>
          ))}
        </div>
      </div>
      <p className="mt-8 text-center text-[11px] opacity-60">© {year} Sip &amp; Soul Café. All rights reserved.</p>
    </footer>
  )
}
