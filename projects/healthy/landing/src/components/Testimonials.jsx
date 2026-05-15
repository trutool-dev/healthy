import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const testimonials = [
  {
    quote: 'Llevaba años intentando ser constante con el gym. Con Healthy por fin lo conseguí — los planes se adaptan a mi vida, no al revés.',
    name: 'Laura M.',
    role: 'Diseñadora · Madrid',
    avatar: 'L',
  },
  {
    quote: 'El módulo de nutrición es lo mejor. Escribo lo que como en lenguaje normal y la app lo entiende todo. Sin apps de conteo de calorías eternas.',
    name: 'Carlos R.',
    role: 'Ingeniero · Barcelona',
    avatar: 'C',
  },
  {
    quote: 'Lo que más me sorprende es cómo detecta cuando estoy cansado y ajusta el entrenamiento automáticamente. Parece que te conoce de verdad.',
    name: 'Ana P.',
    role: 'Médica · Sevilla',
    avatar: 'A',
  },
]

export default function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      className="w-full py-28 px-6"
      style={{ background: 'var(--bg)' }}
      ref={ref}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="badge mb-5 inline-flex">Lo que dicen</span>
          <h2
            style={{
              fontFamily: 'Instrument Serif, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(32px, 4.5vw, 52px)',
              color: '#fff',
              lineHeight: 1.15,
            }}
          >
            Personas reales,<br />resultados reales.
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="liquid-glass p-8 flex flex-col gap-6"
              initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
              animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.75, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Stars */}
              <div className="flex gap-1" aria-label="5 estrellas">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1L8.545 5.18H13L9.468 7.82L10.955 12L7 9.36L3.045 12L4.532 7.82L1 5.18H5.455L7 1Z" fill="#22C55E" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p
                style={{
                  color: 'rgba(255,255,255,0.78)',
                  fontWeight: 300,
                  lineHeight: 1.65,
                  fontSize: 15,
                  flex: 1,
                }}
              >
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--green-muted)',
                    border: '1px solid var(--green-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 14,
                    color: 'var(--green)',
                    flexShrink: 0,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
