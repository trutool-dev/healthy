import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote:  'Perdí 8kg en 3 meses siguiendo el plan de Healthy.',
    author: 'María G.',
    tag:    '−8 kg en 3 meses',
    avatar: 'M',
  },
  {
    quote:  'Gané 5kg de músculo con las rutinas personalizadas.',
    author: 'Carlos M.',
    tag:    '+5 kg músculo',
    avatar: 'C',
  },
  {
    quote:  'Mi energía mejoró completamente en 30 días.',
    author: 'Laura P.',
    tag:    '30 días de cambio',
    avatar: 'L',
  },
  {
    quote:  'El onboarding me sorprendió, todo muy personalizado.',
    author: 'Javier R.',
    tag:    'Onboarding IA',
    avatar: 'J',
  },
]

export default function Testimonials() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      id="testimonios"
      className="w-full py-24 px-6 overflow-hidden"
      style={{ background: 'var(--surface)' }}
    >
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="badge mb-5 inline-flex">Testimonios</span>
          <h2
            className="font-display text-section text-white"
            style={{ fontWeight: 400 }}
          >
            Personas reales,<br />resultados reales.
          </h2>
        </motion.div>

        {/* Pills grid */}
        <div className="flex flex-col gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40, filter: 'blur(6px)' }}
              animate={inView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.75, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
            >
              <TestimonialPill {...t} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialPill({
  quote,
  author,
  tag,
  avatar,
  index,
}: {
  quote: string
  author: string
  tag: string
  avatar: string
  index: number
}) {
  const align = index % 2 === 0 ? 'self-start' : 'self-end'

  return (
    <article
      className={`glass flex items-center gap-5 px-6 py-5 w-full md:max-w-[75%] ${align}`}
      style={{ borderRadius: 100 }}
      aria-label={`Testimonio de ${author}: ${quote}`}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full font-semibold text-[14px]"
        style={{
          width: 42,
          height: 42,
          background: 'var(--green-muted)',
          border: '1px solid var(--green-glow)',
          color: 'var(--green)',
        }}
        aria-hidden="true"
      >
        {avatar}
      </div>

      {/* Text */}
      <p
        className="flex-1 text-[14px] leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.78)', fontWeight: 300 }}
      >
        "{quote}"
      </p>

      {/* Right side */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1 hidden sm:flex">
        <span
          className="text-[11px] font-medium tracking-wide px-3 py-1 rounded-full"
          style={{ background: 'var(--green-muted)', color: 'var(--green)' }}
        >
          {tag}
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>{author}</span>
      </div>
    </article>
  )
}
