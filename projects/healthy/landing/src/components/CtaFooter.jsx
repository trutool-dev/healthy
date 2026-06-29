import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function CtaFooter() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <>
      {/* ── CTA ────────────────────────────────────────────── */}
      <section
        id="download"
        ref={ref}
        className="w-full py-28 px-6"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(34,197,94,0.10) 0%, transparent 70%), var(--bg)',
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="badge mb-6 inline-flex">Disponible ahora</span>
            <h2
              className="mb-5 leading-tight tracking-tight"
              style={{
                fontFamily: 'Instrument Serif, serif',
                fontStyle: 'italic',
                fontSize: 'clamp(38px, 6vw, 68px)',
                color: '#fff',
              }}
            >
              Descarga Healthy.<br />
              <em style={{ color: 'var(--green)' }}>Es gratis.</em>
            </h2>
            <p
              className="mb-10 mx-auto"
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 300,
                fontSize: 17,
                lineHeight: 1.55,
                maxWidth: 380,
              }}
            >
              Empieza con tu plan personalizado en menos de 5 minutos. Sin tarjeta de crédito.
            </p>

            {/* Store buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <StoreButton
                href="#"
                icon={<AppleIcon />}
                pre="Descargar en"
                label="App Store"
              />
              <StoreButton
                href="#"
                icon={<PlayIcon />}
                pre="Disponible en"
                label="Google Play"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer
        className="w-full px-6 py-16"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'var(--bg)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/logo-icon.svg" alt="Healthy" width={24} height={24} />
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 15, color: '#fff' }}>Healthy</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: 300, lineHeight: 1.65 }}>
                IA personalizada para tu salud. Entrenamiento, nutrición y progreso — todo en una app.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: 'Producto',
                links: ['Entrenamiento', 'Nutrición', 'Progreso', 'Planes y precios'],
              },
              {
                title: 'Compañía',
                links: ['Sobre nosotros', 'Blog', 'Prensa', 'Carreras'],
              },
              {
                title: 'Soporte',
                links: ['Centro de ayuda', 'Privacidad', 'Términos', 'Contacto'],
              },
            ].map((group) => (
              <div key={group.title}>
                <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
                  {group.title}
                </p>
                <div className="flex flex-col gap-3">
                  {group.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.target.style.color = '#fff')}
                      onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.55)')}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              © 2026 Healthy. Todos los derechos reservados.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
              Hecho con ❤️ en España
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}

function StoreButton({ href, icon, pre, label }) {
  return (
    <a
      href={href}
      className="liquid-glass flex items-center gap-4 px-6 py-4 transition-transform hover:-translate-y-0.5"
      style={{ borderRadius: 16, minWidth: 180, textDecoration: 'none' }}
    >
      <span style={{ color: '#fff', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontFamily: 'Barlow, sans-serif' }}>
        <span style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{pre}</span>
        <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: '#fff' }}>{label}</span>
      </span>
    </a>
  )
}

function AppleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
    </svg>
  )
}
