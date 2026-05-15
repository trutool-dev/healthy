import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useInView } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 10000, suffix: '+', label: 'Usuarios activos',   prefix: '' },
  { value: 98,    suffix: '%', label: 'Satisfacción',       prefix: '' },
  { value: 3,     suffix: 'x', label: 'Más resultados',     prefix: '' },
  { value: 7,     suffix: '',  label: 'Días para ver cambios', prefix: '' },
]

function CounterDigit({
  target,
  suffix,
  prefix,
  inView,
}: {
  target: number
  suffix: string
  prefix: string
  inView: boolean
}) {
  const elRef = useRef<HTMLSpanElement>(null)
  const tweenRef = useRef<{ val: number }>({ val: 0 })

  useEffect(() => {
    if (!inView || !elRef.current) return

    const obj = tweenRef.current
    obj.val = 0

    const tween = gsap.to(obj, {
      val: target,
      duration: 2.2,
      ease: 'power3.out',
      onUpdate: () => {
        if (elRef.current) {
          const display = target >= 1000
            ? Math.floor(obj.val).toLocaleString('es-ES')
            : Math.floor(obj.val).toString()
          elRef.current.textContent = display
        }
      },
    })

    return () => { tween.kill() }
  }, [inView, target])

  return (
    <span>
      {prefix}
      <span ref={elRef}>0</span>
      {suffix}
    </span>
  )
}

export default function Stats() {
  const ref    = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="stats"
      ref={ref}
      className="w-full py-28 px-6"
      style={{ background: 'var(--surface)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="badge mb-5 inline-flex">En números</span>
          <h2
            className="font-display text-section text-white"
            style={{ fontWeight: 400 }}
          >
            Resultados que<br />hablan solos.
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass rounded-[20px] p-8 text-center flex flex-col items-center"
              initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
              animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.75, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Value */}
              <div
                className="font-body font-semibold leading-none mb-3"
                style={{
                  fontSize: 'clamp(40px, 6vw, 64px)',
                  background: 'linear-gradient(90deg, #22C55E 0%, #4ade80 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                <CounterDigit
                  target={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  inView={inView}
                />
              </div>

              {/* Label */}
              <p
                className="text-[13px] text-center leading-snug"
                style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
