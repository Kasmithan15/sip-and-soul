import { company, contact, navLinks } from '../data/content'
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, XIcon, YoutubeIcon } from './Icons'
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
      <div className="mt-8 flex flex-col items-center gap-1 border-t border-white/10 pt-6 text-center">
        <span className="text-[11px] tracking-[.25em] text-gold">GET IN TOUCH</span>
        <div className="flex flex-col items-center gap-x-8 gap-y-1 sm:flex-row">
          <a href={contact.phoneHref} className="flex items-center gap-2 font-serif text-lg transition hover:text-gold">
            <PhoneIcon className="size-[18px]" />
            {contact.phone}
          </a>
          <a href={`mailto:${contact.email}`} className="flex items-center gap-2 font-serif text-lg transition hover:text-gold">
            <MailIcon className="size-[18px]" />
            {contact.email}
          </a>
        </div>
      </div>
      <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] sm:flex-row">
        <p className="opacity-60">© {year} Sip &amp; Soul Café. All rights reserved.</p>
        <p className="flex items-center gap-2 opacity-80">
          <span className="opacity-75">Designed &amp; developed by</span>
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-gold/40 px-3 py-1 font-semibold tracking-[.12em] text-gold uppercase transition hover:bg-gold hover:text-roast"
          >
            {company.name}
          </a>
        </p>
      </div>
    </footer>
  )
}
