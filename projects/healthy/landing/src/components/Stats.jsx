import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { value: '50', suffix: 'K+', label: 'Usuarios activos' },
  { value: '4', suffix: '.9★', label: 'Valoración media' },
  { value: '2', suffix: 'M+', label: 'Entrenamientos completados' },
  { value: '92', suffix: '%', label: 'Repiten tras el primer mes' },
]

export default function Stats() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      className="video-section video-fade-top video-fade-bottom"
      style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', padding: '100px 0' }}
    >
      {/* B&W food video */}
      <video
        autoPlay muted loop playsInline
        aria-hidden="true"
        style={{ filter: 'grayscale(1) brightness(0.35)' }}
      >
        <source src="/videos/healthy_food.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-[1]" style={{ background: 'rgba(8,8,8,0.55)' }} />

      <div ref={ref} className="relative z-[2] w-full max-w-5xl mx-auto px-6">
        <motion.div
          className="liquid-glass p-12 md:p-16"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className="text-center mb-12"
            style={{
              fontFamily: 'Instrument Serif, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              color: '#fff',
            }}
          >
            Resultados que hablan por sí solos.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(36px, 5vw, 52px)',
                    color: '#fff',
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {s.value}
                  <span style={{ color: 'var(--green)' }}>{s.suffix}</span>
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
