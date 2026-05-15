import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const steps = [
  {
    num: '01',
    title: 'Cuéntanos cómo eres',
    body: 'Completa tu perfil en 3 minutos: objetivos, nivel de actividad, restricciones alimentarias y horarios. Sin formularios interminables.',
  },
  {
    num: '02',
    title: 'La IA diseña tu plan',
    body: 'Nuestro modelo genera un plan de entrenamiento y nutrición completamente personalizado, ajustado a tu cuerpo y tu día a día.',
  },
  {
    num: '03',
    title: 'Progresa y mejora',
    body: 'Cada sesión retroalimenta el sistema. Tu plan evoluciona contigo: más duro cuando estás en racha, más suave cuando lo necesitas.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: 'blur(6px)' },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="como-funciona"
      className="video-section video-fade-top video-fade-bottom"
      style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', padding: '120px 0' }}
    >
      {/* Background video */}
      <video autoPlay muted loop playsInline aria-hidden="true">
        <source src="/videos/runners.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: 'rgba(8,8,8,0.72)' }}
      />

      <div className="relative z-[2] w-full max-w-6xl mx-auto px-6" ref={ref}>
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          custom={0}
        >
          <span className="badge mb-5 inline-flex">Cómo funciona</span>
          <h2
            className="leading-tight tracking-tight"
            style={{
              fontFamily: 'Instrument Serif, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(36px, 5vw, 58px)',
              color: '#fff',
            }}
          >
            Tres pasos para empezar.
          </h2>
        </motion.div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="liquid-glass p-8"
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={i + 1}
            >
              <span
                style={{
                  fontFamily: 'Barlow, sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: '0.1em',
                  color: 'var(--green)',
                  display: 'block',
                  marginBottom: 16,
                }}
              >
                {step.num}
              </span>
              <h3
                className="mb-4"
                style={{
                  fontFamily: 'Instrument Serif, serif',
                  fontSize: 24,
                  color: '#fff',
                  lineHeight: 1.25,
                }}
              >
                {step.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.62)', fontWeight: 300, lineHeight: 1.6, fontSize: 15 }}>
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
