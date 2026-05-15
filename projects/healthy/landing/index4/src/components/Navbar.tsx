import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const NAV_LINKS = [
  { label: 'Características', href: '#features'  },
  { label: 'Progreso',        href: '#stats'      },
  { label: 'Testimonios',     href: '#testimonios' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navRef                  = useRef<HTMLElement>(null)

  // GSAP entrance
  useEffect(() => {
    gsap.from(navRef.current, {
      y: -32,
      opacity: 0,
      duration: 1,
      delay: 0.15,
      ease: 'power4.out',
    })
  }, [])

  // Scroll effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <nav
        className={`
          glass flex items-center gap-6 px-5 py-3 rounded-full
          transition-shadow duration-300 w-full
          ${scrolled ? 'shadow-[0_8px_48px_rgba(0,0,0,0.6)]' : ''}
        `}
        style={{ maxWidth: 740 }}
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 flex-shrink-0" aria-label="Healthy App">
          <img src="/images/logo-icon.svg" alt="" width={26} height={26} aria-hidden="true" />
          <span className="text-white font-semibold text-[14px] tracking-tight">Healthy</span>
        </a>

        {/* Links */}
        <div className="hidden md:flex items-center gap-5 flex-1 justify-center">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-[13px] font-medium transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.55)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)')}
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a href="#download" className="btn-primary flex-shrink-0 !py-2.5 !px-5 !text-[13px]">
          Descarga gratis
        </a>
      </nav>
    </header>
  )
}
