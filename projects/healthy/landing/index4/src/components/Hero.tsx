import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Hls from 'hls.js'
import { AnimatePresence, motion } from 'framer-motion'

const ROLES  = ['Nutrición', 'Entrenamiento', 'Progreso', 'Bienestar']
const VIDEO  = '/videos/video_smoothy.mp4'
const POSTER = '/images/portada.jpg'

export default function Hero() {
  const [roleIdx, setRoleIdx] = useState(0)

  const videoRef    = useRef<HTMLVideoElement>(null)
  const titleRef    = useRef<HTMLDivElement>(null)
  const descRef     = useRef<HTMLParagraphElement>(null)
  const ctaRef      = useRef<HTMLDivElement>(null)
  const scrollCueRef= useRef<HTMLDivElement>(null)

  // Video — supports both HLS and direct MP4
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported() && VIDEO.endsWith('.m3u8')) {
      const hls = new Hls({ startLevel: -1 })
      hls.loadSource(VIDEO)
      hls.attachMedia(video)
      return () => hls.destroy()
    } else {
      // Direct MP4 playback
      video.src = VIDEO
    }

    video.play().catch(() => {
      // Autoplay blocked — silently fail
    })
  }, [])

  // GSAP entrance timeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 })

      tl.from(titleRef.current, {
        y: 80,
        opacity: 0,
        duration: 1.3,
        ease: 'power4.out',
      })
        .from(descRef.current, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        }, '-=0.7')
        .from(ctaRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
        }, '-=0.6')
        .from(scrollCueRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
        }, '-=0.3')
    })

    return () => ctx.revert()
  }, [])

  // Role rotation
  useEffect(() => {
    const id = setInterval(() => setRoleIdx(i => (i + 1) % ROLES.length), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden video-fade-y"
    >
      {/* Background video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        muted
        loop
        playsInline
        poster={POSTER}
        aria-hidden="true"
      />

      {/* Dark cinematic overlay */}
      <div
        className="video-overlay"
        style={{
          background:
            'linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.3) 40%, rgba(10,10,10,0.72) 100%)',
        }}
      />

      {/* Noise grain texture overlay */}
      <div
        className="video-overlay opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Content */}
      <div className="relative z-[3] text-center px-6 max-w-5xl mx-auto pt-24 pb-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-8 flex justify-center"
        >
          <span className="badge">
            <span
              className="inline-block rounded-full"
              style={{ width: 6, height: 6, background: 'var(--green)', flexShrink: 0 }}
            />
            IA de salud personalizada
          </span>
        </motion.div>

        {/* Title block */}
        <div ref={titleRef}>
          <h1
            className="font-display text-hero text-white mb-4"
            style={{ fontWeight: 400 }}
          >
            Healthy App
          </h1>

          {/* Rotating role */}
          <div className="h-[1.15em] overflow-hidden mb-8" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={roleIdx}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0,  opacity: 1 }}
                exit={{    y: -50, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="block text-gradient-green font-display"
                style={{ fontWeight: 400 }}
                aria-live="polite"
              >
                {ROLES[roleIdx]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Description */}
        <p
          ref={descRef}
          className="mx-auto mb-10 max-w-lg"
          style={{
            color: 'rgba(255,255,255,0.72)',
            fontWeight: 300,
            fontSize: 'clamp(16px, 2vw, 18px)',
            lineHeight: 1.65,
          }}
        >
          Tu plan de salud personalizado con IA. Adaptado a tu cuerpo,
          tu ritmo y tus objetivos.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-wrap gap-4 justify-center">
          <a href="#download" className="btn-primary">
            Descarga gratis
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2v9M4 7l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#features" className="btn-ghost">
            Ver la app
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <div ref={scrollCueRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3]">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <svg width="20" height="30" viewBox="0 0 20 30" fill="none">
            <rect x="1" y="1" width="18" height="28" rx="9" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <rect x="9" y="6" width="2" height="6" rx="1" fill="rgba(255,255,255,0.4)" />
          </svg>
        </motion.div>
      </div>
    </section>
  )
}
