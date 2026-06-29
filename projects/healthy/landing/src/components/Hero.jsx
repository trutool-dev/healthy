import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: 'blur(8px)' },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function Hero() {
  return (
    <section
      className="video-section video-fade-top video-fade-bottom"
      style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/images/portada.jpg"
        aria-hidden="true"
      >
        <source src="/videos/fitness_workout.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: 'linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.35) 50%, rgba(8,8,8,0.72) 100%)' }}
      />

      {/* Content */}
      <div className="relative z-[2] text-center px-6 max-w-4xl mx-auto pt-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <span className="badge mb-8 inline-flex">
            <span style={{ background: 'var(--green)', width: 6, height: 6, borderRadius: '50%', flexShrink: 0 }} />
            IA de salud personalizada
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="mb-6 leading-[1.05] tracking-tight"
          style={{
            fontFamily: 'Instrument Serif, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(52px, 8vw, 96px)',
            color: '#fff',
          }}
        >
          Tu cuerpo.<br />
          Tu <em style={{ color: 'var(--green)', fontStyle: 'italic' }}>mejor</em><br />
          versión.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mb-10 mx-auto max-w-xl"
          style={{
            fontFamily: 'Barlow, sans-serif',
            fontWeight: 300,
            fontSize: 'clamp(17px, 2.5vw, 20px)',
            color: 'rgba(255,255,255,0.78)',
            lineHeight: 1.55,
          }}
        >
          IA que aprende cómo eres, diseña tu entrenamiento,
          optimiza tu nutrición y mide tu progreso real.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a href="#download" className="btn-primary">
            Descargar Healthy <span aria-hidden="true">→</span>
          </a>
          <a href="#como-funciona" className="btn-outline">
            Ver cómo funciona
          </a>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="mt-16"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <svg width="20" height="32" viewBox="0 0 20 32" fill="none" className="mx-auto" aria-hidden="true">
            <rect x="1" y="1" width="18" height="30" rx="9" stroke="currentColor" strokeWidth="1.5" />
            <motion.rect
              x="9" y="7" width="2" height="6" rx="1" fill="currentColor"
              animate={{ y: [7, 14, 7] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>
      </div>
    </section>
  )
}
