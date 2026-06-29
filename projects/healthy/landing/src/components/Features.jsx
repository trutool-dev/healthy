import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const features = [
  {
    id: 'entrenamiento',
    label: 'Entrenamiento',
    title: 'Cada sesión,\ndiseñada para ti.',
    body: 'La IA analiza tu historial, tu nivel actual y tu disponibilidad para crear el entrenamiento exacto que necesitas hoy.',
    bullets: [
      'Planes de fuerza, HIIT, yoga y cardio',
      'Ajuste dinámico según tu progresión',
      'Timer de descanso y feedback en tiempo real',
      'Vídeos guía para cada ejercicio',
    ],
    visual: <TrainingVisual />,
    reverse: false,
  },
  {
    id: 'nutricion',
    label: 'Nutrición',
    title: 'Come bien.\nSin contar calorías.',
    body: 'Describe lo que comes con lenguaje natural. La IA interpreta, registra y te sugiere ajustes sin obsesionarte con los números.',
    bullets: [
      'Registro por voz o texto libre',
      'Balance de macros automático',
      'Recetas personalizadas a tus gustos',
      'Plan de comidas semanal',
    ],
    visual: <NutritionVisual />,
    reverse: true,
  },
  {
    id: 'progreso',
    label: 'Progreso',
    title: 'Mide lo que\nde verdad importa.',
    body: 'Más allá del peso: recuperación, energía, sueño y métricas de rendimiento. Una vista completa de tu salud real.',
    bullets: [
      'Score de recuperación diario',
      'Evolución de fuerza y resistencia',
      'Fotos de progreso privadas',
      'Informes semanales con insights IA',
    ],
    visual: <ProgressVisual />,
    reverse: false,
  },
]

function FeatureRow({ feature }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const content = (
    <motion.div
      className="flex flex-col justify-center"
      initial={{ opacity: 0, x: feature.reverse ? 40 : -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="badge mb-5 inline-flex self-start">{feature.label}</span>
      <h2
        className="mb-5 leading-tight tracking-tight whitespace-pre-line"
        style={{
          fontFamily: 'Instrument Serif, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(32px, 4.5vw, 52px)',
          color: '#fff',
        }}
      >
        {feature.title}
      </h2>
      <p className="mb-7" style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 300, lineHeight: 1.65, maxWidth: 420, fontSize: 16 }}>
        {feature.body}
      </p>
      <ul className="list-green space-y-2">
        {feature.bullets.map((b) => <li key={b}>{b}</li>)}
      </ul>
    </motion.div>
  )

  const visual = (
    <motion.div
      initial={{ opacity: 0, x: feature.reverse ? -40 : 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex justify-center items-center"
    >
      {feature.visual}
    </motion.div>
  )

  return (
    <section
      id={feature.id}
      ref={ref}
      className="w-full max-w-6xl mx-auto px-6 py-24"
    >
      <div className={`grid md:grid-cols-2 gap-16 items-center ${feature.reverse ? 'md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1' : ''}`}>
        {content}
        {visual}
      </div>
    </section>
  )
}

/* ─── Phone mockup shell ─────────────────────────────────────────── */
function PhoneMockup({ children }) {
  return (
    <div
      className="liquid-glass relative mx-auto"
      style={{
        width: 260,
        height: 520,
        borderRadius: 44,
        overflow: 'hidden',
        background: '#0e0e0e',
      }}
    >
      {/* Notch */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-10"
        style={{ width: 90, height: 26, background: '#080808', borderRadius: 20 }}
      />
      {children}
    </div>
  )
}

/* ─── Training visual ────────────────────────────────────────────── */
function TrainingVisual() {
  const exercises = ['Sentadilla 4×8', 'Press banca 3×10', 'Peso muerto 3×6', 'Dominadas 3×AMRAP']
  return (
    <PhoneMockup>
      <div className="absolute inset-0 pt-14 px-4 pb-4 flex flex-col gap-3 overflow-hidden">
        <div style={{ color: 'var(--green)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Hoy — Fuerza A
        </div>
        <div style={{ color: '#fff', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 20, lineHeight: 1.2 }}>
          4 ejercicios · 52 min
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {exercises.map((ex, i) => (
            <div
              key={ex}
              className="liquid-glass flex items-center gap-3 px-4 py-3"
              style={{ borderRadius: 12 }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: i === 0 ? 'var(--green)' : 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: i === 0 ? '#000' : 'rgba(255,255,255,0.4)',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <span style={{ fontSize: 13, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)' }}>{ex}</span>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mt-auto">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
            <span>Progreso</span><span>1/4</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
            <div style={{ width: '25%', height: '100%', background: 'var(--green)', borderRadius: 2 }} />
          </div>
        </div>
      </div>
    </PhoneMockup>
  )
}

/* ─── Nutrition visual ───────────────────────────────────────────── */
function NutritionVisual() {
  const meals = [
    { name: 'Desayuno', kcal: 420, color: '#22C55E' },
    { name: 'Almuerzo', kcal: 680, color: '#16A34A' },
    { name: 'Cena', kcal: 520, color: '#15803D' },
  ]
  return (
    <PhoneMockup>
      <div className="absolute inset-0 pt-14 px-4 pb-4 flex flex-col gap-3 overflow-hidden">
        <div style={{ color: 'var(--green)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Hoy — Nutrición
        </div>
        {/* Macro rings row */}
        <div className="flex justify-between mt-1">
          {[
            { label: 'Proteína', val: '142g', pct: 72 },
            { label: 'Carbs', val: '210g', pct: 58 },
            { label: 'Grasa', val: '68g', pct: 84 },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-1">
              <svg width="44" height="44" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <circle
                  cx="22" cy="22" r="16" fill="none"
                  stroke="var(--green)" strokeWidth="4"
                  strokeDasharray={`${(m.pct / 100) * 100.5} 100.5`}
                  strokeLinecap="round"
                  transform="rotate(-90 22 22)"
                />
                <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="600" fill="#fff">{m.pct}%</text>
              </svg>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{m.label}</span>
              <span style={{ fontSize: 11, color: '#fff', fontWeight: 500 }}>{m.val}</span>
            </div>
          ))}
        </div>
        {/* Meals */}
        <div className="flex flex-col gap-2 mt-1">
          {meals.map((meal) => (
            <div key={meal.name} className="liquid-glass flex items-center justify-between px-4 py-3" style={{ borderRadius: 12 }}>
              <div className="flex items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: meal.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#fff' }}>{meal.name}</span>
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{meal.kcal} kcal</span>
            </div>
          ))}
        </div>
        {/* Total */}
        <div className="liquid-glass px-4 py-3 mt-auto flex justify-between items-center" style={{ borderRadius: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Total hoy</span>
          <span style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>1620 kcal</span>
        </div>
      </div>
    </PhoneMockup>
  )
}

/* ─── Progress visual ────────────────────────────────────────────── */
function ProgressVisual() {
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const scores = [72, 85, 61, 90, 78, 88, 94]
  const max = Math.max(...scores)

  return (
    <PhoneMockup>
      <div className="absolute inset-0 pt-14 px-4 pb-4 flex flex-col gap-3 overflow-hidden">
        <div style={{ color: 'var(--green)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Recuperación
        </div>
        {/* Score big */}
        <div className="flex items-baseline gap-2">
          <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 52, color: '#fff', lineHeight: 1 }}>94</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>/ 100 · Excelente</span>
        </div>
        {/* Bar chart */}
        <div className="flex items-end justify-between gap-1 mt-2" style={{ height: 80 }}>
          {days.map((d, i) => (
            <div key={d} className="flex flex-col items-center gap-1 flex-1">
              <div
                style={{
                  width: '100%',
                  height: `${(scores[i] / max) * 70}px`,
                  background: i === 6 ? 'var(--green)' : 'rgba(255,255,255,0.1)',
                  borderRadius: 4,
                  transition: 'height 0.4s ease',
                }}
              />
              <span style={{ fontSize: 9, color: i === 6 ? 'var(--green)' : 'rgba(255,255,255,0.35)' }}>{d}</span>
            </div>
          ))}
        </div>
        {/* Metrics row */}
        {[
          { label: 'Sueño', val: '7h 42m' },
          { label: 'Pasos', val: '11 204' },
          { label: 'HRV', val: '58 ms' },
        ].map((m) => (
          <div key={m.label} className="liquid-glass flex justify-between px-4 py-2.5" style={{ borderRadius: 10 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{m.label}</span>
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{m.val}</span>
          </div>
        ))}
      </div>
    </PhoneMockup>
  )
}

export default function Features() {
  return (
    <div className="w-full" style={{ background: 'var(--bg)' }}>
      {features.map((f) => (
        <FeatureRow key={f.id} feature={f} />
      ))}
    </div>
  )
}
