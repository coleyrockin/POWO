'use client'
import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 })

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-green), var(--accent-amber), var(--accent-coral), var(--accent-purple))',
        transformOrigin: '0%',
        scaleX,
        zIndex: 10000,
        pointerEvents: 'none',
      }}
    />
  )
}
