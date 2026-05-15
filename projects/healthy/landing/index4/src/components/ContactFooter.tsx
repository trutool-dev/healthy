import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import { motion, useInView } from 'framer-motion'

const VIDEO    = '/videos/video_smoothy.mp4'
const MARQUEE  = 'TRANSFORMA TU SALUD • '

export default function ContactFooter() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const ref      = useRef<HTMLDivElement>(null)
  const inView   = useInView(ref, { once: true, margin: '-80px' })

  // Video — flipped vertically, same source as hero
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported() && VIDEO.endsWith('.m3u8')) {
      const hls = new Hls()
      hls.loadSource(VIDEO)
      hls.attachMedia(video)
      return () => hls.destroy()
    } else {
      video.src = VIDEO
    }
    video.play().catch(() => {})
  }, [])

  return (
    <>
      {/* ── MARQUEE DIVIDER ──────────────────────────────── */}
      <div
        className="w-full overflow-hidden py-6"
        style={{
          background: 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)',
        }}
        aria-hidden="true"
      >
        <div className="marquee-track marquee-run select-none" style={{ gap: 0 }}>
          {/* Duplicate for seamless loop */}
          {[0, 1].map(k => (
            <span key={k} className="flex-shrink-0">
              {Array(12).fill(MARQUEE).map((text, i) => (
                <span
                  key={i}
                  className="text-black font-semibold tracking-[0.15em] uppercase"
                  style={{ fontSize: 13, marginRight: 0, paddingRight: '2em' }}
                >
                  {text}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── CONTACT / CTA ────────────────────────────────── */}
      <section
        id="download"
        className="relative overflow-hidden video-fade-y"
        style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}
      >
        {/* Flipped video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
          muted
          loop
          playsInline
          aria-hidden="true"
          style={{ transform: 'scaleY(-1)' }}
        />

        {/* Overlay */}
        <div
          className="video-overlay"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.75) 100%)',
          }}
        />

        {/* Content */}
        <div ref={ref} className="relative z-[3] w-full max-w-3xl mx-auto px-6 text-center py-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="badge mb-7 inline-flex">Disponible ahora</span>

            <h2
              className="font-display text-section text-white mb-6"
              style={{ fontWeight: 400 }}
            >
              Descarga Healthy{' '}
              <em className="text-gradient-green">gratis</em>
            </h2>

            <p
              className="mx-auto mb-10 max-w-sm text-[16px] leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.62)', fontWeight: 300 }}
            >
              Empieza hoy. Sin tarjeta de crédito.
              Tu primer plan listo en menos de 5 minutos.
            </p>

            {/* Store buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-14">
              <StoreButton
                href="#"
                icon={<AppleIcon />}
                pre="Descargar en"
                label="App Store"
                aria-label="Descargar en App Store"
              />
              <StoreButton
                href="#"
                icon={<PlayIcon />}
                pre="Disponible en"
                label="Google Play"
                aria-label="Disponible en Google Play"
              />
            </div>

            {/* Social links */}
            <div className="flex items-center justify-center gap-6">
              {SOCIALS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="transition-opacity hover:opacity-60"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer
        className="w-full px-6 py-12"
        style={{
          background: 'var(--bg)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <img src="/images/logo-icon.svg" alt="Healthy" width={22} height={22} />
            <span
              className="font-semibold text-[14px] text-white tracking-tight"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Healthy
            </span>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap gap-5 justify-center" aria-label="Footer navigation">
            {['Entrenamiento', 'Nutrición', 'Progreso', 'Privacidad', 'Términos'].map(link => (
              <a
                key={link}
                href="#"
                className="text-[13px] transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.38)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.75)')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.38)')}
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>
            © 2026 Healthy
          </p>
        </div>
      </footer>
    </>
  )
}

/* ── Sub-components ──────────────────────────────────────────────── */

function StoreButton({
  href,
  icon,
  pre,
  label,
  'aria-label': ariaLabel,
}: {
  href: string
  icon: React.ReactNode
  pre: string
  label: string
  'aria-label': string
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className="glass-strong flex items-center gap-4 px-6 py-4 transition-transform hover:-translate-y-0.5"
      style={{ borderRadius: 16, textDecoration: 'none', minWidth: 175 }}
    >
      <span style={{ color: '#fff', flexShrink: 0 }} aria-hidden="true">{icon}</span>
      <span style={{ fontFamily: 'Inter, sans-serif' }}>
        <span style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{pre}</span>
        <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: '#fff' }}>{label}</span>
      </span>
    </a>
  )
}

const SOCIALS = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

function AppleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
    </svg>
  )
}
