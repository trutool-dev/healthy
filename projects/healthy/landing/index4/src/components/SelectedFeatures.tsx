import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = [
  {
    id: 'ai',
    label: '01 — Planes con IA',
    title: 'Personalizados según tu perfil',
    body: 'Nuestro modelo analiza tu historial, objetivos y estilo de vida para crear un plan que se adapta contigo día a día.',
    accent: true,
    wide: true,
    img: '/images/smoothy.png',
  },
  {
    id: 'nutrition',
    label: '02 — Nutrición inteligente',
    title: 'Dieta adaptada a tu objetivo',
    body: 'Registra lo que comes con lenguaje natural. La IA equilibra tus macros y propone ajustes sin obsesionarte con los números.',
    accent: false,
    wide: false,
  },
  {
    id: 'training',
    label: '03 — Entrenamiento guiado',
    title: 'Rutinas para tu nivel',
    body: 'Desde principiante hasta élite. Cada sesión tiene timer, feedback y vídeos de guía en tiempo real.',
    accent: false,
    wide: false,
  },
  {
    id: 'progress',
    label: '04 — Progreso real',
    title: 'Métricas estilo Whoop',
    body: 'Recuperación, HRV, sueño y rendimiento. Una vista completa de tu salud, no solo el peso.',
    accent: false,
    wide: true,
    img: '/images/smoothy_2.png',
  },
]

const cardVariants = {
  hidden:  { opacity: 0, y: 48, filter: 'blur(8px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
}

function FeatureCard({
  feature,
  index,
  inView,
}: {
  feature: typeof FEATURES[number]
  index: number
  inView: boolean
}) {
  const colSpan = feature.wide ? 'md:col-span-2' : 'md:col-span-1'

  return (
    <motion.article
      className={`glass rounded-[20px] overflow-hidden flex flex-col ${colSpan}`}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={index}
      style={{ minHeight: 280 }}
    >
      {/* Image if available */}
      {feature.img && (
        <div className="relative overflow-hidden" style={{ height: 200 }}>
          <img
            src={feature.img}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.7) saturate(0.8)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(10,10,10,0.9) 100%)' }}
          />
        </div>
      )}

      <div className={`flex flex-col flex-1 p-7 ${feature.img ? '-mt-10 relative z-10' : ''}`}>
        {/* Label */}
        <span
          className="text-[11px] font-medium tracking-[0.2em] uppercase mb-3 block"
          style={{ color: feature.accent ? 'var(--green)' : 'rgba(255,255,255,0.38)' }}
        >
          {feature.label}
        </span>

        {/* Title */}
        <h3
          className="font-display text-card text-white mb-3"
          style={{ fontWeight: 400 }}
        >
          {feature.title}
        </h3>

        {/* Body */}
        <p
          className="text-[14px] leading-relaxed flex-1"
          style={{ color: 'rgba(255,255,255,0.58)', fontWeight: 300 }}
        >
          {feature.body}
        </p>

        {/* Green accent bar on accent card */}
        {feature.accent && (
          <div
            className="mt-5 h-[3px] w-16 rounded-full"
            style={{ background: 'linear-gradient(90deg, #22C55E, #16A34A)' }}
          />
        )}
      </div>
    </motion.article>
  )
}

export default function SelectedFeatures() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="w-full py-28 px-6" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="badge mb-5 inline-flex">Funcionalidades</span>
          <h2
            className="font-display text-section text-white"
            style={{ fontWeight: 400, maxWidth: 520 }}
          >
            Todo lo que necesitas
          </h2>
        </motion.div>

        {/* Bento grid — 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.id} feature={f} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}
