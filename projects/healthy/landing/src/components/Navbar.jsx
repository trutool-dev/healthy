import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav
        className={`
          liquid-glass flex items-center gap-8 px-6 py-3 rounded-pill transition-all duration-300
          ${scrolled ? 'shadow-[0_8px_40px_rgba(0,0,0,0.5)]' : ''}
        `}
        style={{ maxWidth: 720, width: '100%' }}
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 flex-shrink-0">
          <img src="/images/logo-icon.svg" alt="Healthy" width={28} height={28} />
          <span
            className="text-white font-semibold text-[15px] tracking-tight"
            style={{ fontFamily: 'Barlow, sans-serif' }}
          >
            Healthy
          </span>
        </a>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {['Entrenamiento', 'Nutrición', 'Progreso'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="text-[13px] font-medium transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.62)', fontFamily: 'Barlow, sans-serif' }}
              onMouseEnter={e => (e.target.style.color = '#fff')}
              onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.62)')}
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a href="#download" className="btn-primary text-[13px] px-4 py-2 flex-shrink-0">
          Descargar
        </a>
      </nav>
    </motion.header>
  )
}
