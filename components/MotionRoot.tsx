'use client'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'

// LazyMotion + the `m` component ships ~18KB instead of the full ~100KB+ `motion`
// bundle. `strict` makes any stray `m.*` (instead of `m.*`) throw, so an
// incomplete migration can't silently reload the full feature set.
export default function MotionRoot({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
