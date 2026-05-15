import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useInView } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)

const IMAGES = [
  { src: '/images/smoothy.png',   speed: -0.18, scale: 1.12, delay: 0 },
  { src: '/images/portada.jpg',   speed:  0.14, scale: 1.10, delay: 0.05 },
  { src: '/images/smoothy_2.png', speed: -0.22, scale: 1.15, delay: 0.1 },
  { src: '/images/smoothy.png',   speed:  0.16, scale: 1.10, delay: 0.08 },
]

export default function ParallaxGallery() {
  const sectionRef    = useRef<HTMLElement>(null)
  const titleRef      = useRef<HTMLDivElement>(null)
  const imgRefs       = useRef<(HTMLDivElement | null)[]>([])
  const inViewRef     = useRef<HTMLDivElement>(null)
  const inView        = useInView(inViewRef, { once: true, margin: '-100px' })

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title parallax
      gsap.to(titleRef.current, {
        yPercent: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      })

      // Per-image parallax
      imgRefs.current.forEach((el, i) => {
        if (!el) return
        const { speed } = IMAGES[i]

        gsap.to(el, {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-32"
      style={{ background: 'var(--bg)' }}
    >
      {/* Sticky headline */}
      <div ref={inViewRef} className="max-w-6xl mx-auto px-6 mb-16">
        <motion.div
          ref={titleRef}
          className="will-change-transform"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="badge mb-6 inline-flex">Galería</span>
          <h2
            className="font-display text-section text-white"
            style={{ fontWeight: 400, maxWidth: 540 }}
          >
            Diseñado para ti
          </h2>
          <p
            className="mt-4 max-w-md text-[15px] leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}
          >
            Cada detalle pensado para que nunca pierdas el hilo de tu progreso.
          </p>
        </motion.div>
      </div>

      {/* Masonry-style parallax grid */}
      <div
        className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 items-start"
        style={{ gridAutoRows: 'min-content' }}
      >
        {IMAGES.map((img, i) => (
          <div
            key={i}
            ref={el => { imgRefs.current[i] = el }}
            className="will-change-transform overflow-hidden rounded-[16px]"
            style={{
              marginTop: i % 2 === 1 ? '5rem' : '0',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 1.0,
                delay: img.delay + i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="overflow-hidden rounded-[16px]"
            >
              <img
                src={img.src}
                alt={`Healthy App — vista ${i + 1}`}
                className="w-full object-cover transition-transform duration-700 hover:scale-105"
                style={{
                  height: i % 2 === 0 ? 320 : 240,
                  transform: `scale(${img.scale})`,
                  filter: 'brightness(0.85) saturate(0.9)',
                }}
                loading="lazy"
              />
            </motion.div>
          </div>
        ))}
      </div>

      {/* Bottom gradient bleed into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--surface))' }}
      />
    </section>
  )
}
