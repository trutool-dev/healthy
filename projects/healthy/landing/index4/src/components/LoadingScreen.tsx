import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'

const WORDS = ['Nutrición', 'Entrenamiento', 'Bienestar']
const DURATION_MS = 2700

interface Props {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: Props) {
  const [count, setCount]         = useState(0)
  const [wordIdx, setWordIdx]     = useState(0)
  const containerRef              = useRef<HTMLDivElement>(null)
  const progressRef               = useRef<HTMLDivElement>(null)
  const rafRef                    = useRef<number>(0)
  const startRef                  = useRef<number>(0)

  const exit = useCallback(() => {
    gsap.to(containerRef.current, {
      yPercent: -100,
      duration: 0.95,
      ease: 'power4.inOut',
      onComplete,
    })
  }, [onComplete])

  useEffect(() => {
    // Word rotation every DURATION_MS / WORDS.length
    const wordInterval = DURATION_MS / WORDS.length
    const wordTimer = setInterval(() => {
      setWordIdx(i => (i + 1) % WORDS.length)
    }, wordInterval)

    // RAF counter
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now
      const elapsed  = now - startRef.current
      const progress = Math.min(elapsed / DURATION_MS, 1)
      // ease-out-cubic
      const eased    = 1 - Math.pow(1 - progress, 3)

      setCount(Math.floor(eased * 100))
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${eased})`
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setCount(100)
        clearInterval(wordTimer)
        setTimeout(exit, 320)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      clearInterval(wordTimer)
      cancelAnimationFrame(rafRef.current)
    }
  }, [exit])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] select-none"
      aria-label="Cargando Healthy App"
      aria-live="polite"
    >
      {/* Rotating word */}
      <div className="h-6 mb-10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={wordIdx}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{    y: -18, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="block text-xs font-medium tracking-[0.28em] uppercase"
            style={{ color: '#22C55E' }}
          >
            {WORDS[wordIdx]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Counter */}
      <div
        className="font-display leading-none tabular-nums"
        style={{
          fontSize: 'clamp(88px, 16vw, 168px)',
          color: '#fff',
          fontWeight: 300,
          letterSpacing: '-0.04em',
        }}
        aria-hidden="true"
      >
        {String(count).padStart(3, '0')}
      </div>

      {/* Progress bar */}
      <div
        className="mt-12 w-56 h-[2px] rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <div
          ref={progressRef}
          className="h-full origin-left rounded-full"
          style={{
            background: 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)',
            transform: 'scaleX(0)',
          }}
        />
      </div>

      {/* Subtle vignette ring */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />
    </div>
  )
}
