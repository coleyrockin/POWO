'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'

const AWARDS = [
  { icon: '🏆', title: 'VO₂ MAX PERSONAL BEST',  desc: 'Hit 38.3 mL/kg/min — up from 33.4 in February. 14.7% improvement in 10 weeks.' },
  { icon: '⛳', title: 'BIG GOLF WEEK',           desc: '4 rounds logged. Apr 12: 156-minute session burning 1,330 calories. Week\'s biggest single-session burn.' },
  { icon: '💓', title: 'HRV RECOVERY SURGE',      desc: 'HRV climbed from 25 ms (Apr 8) to 71 ms by week\'s end — a 3× improvement signaling strong cardiovascular recovery.' },
  { icon: '🔥', title: '10K STEP DAY',            desc: 'Apr 8 hit 10,445 steps — the week\'s high — combined with 140 minutes of exercise and two workout sessions.' },
  { icon: '💪', title: '120 PUSHUPS THIS WEEK',   desc: '4 sessions, best set at 40 reps on Apr 11. Building consistency in upper body work.' },
  { icon: '⚡', title: '18 WORKOUT SESSIONS',     desc: 'Golf, weight training, walking, running — 18 logged sessions across 6 active days.' },
]

export default function Awards() {
  return (
    <section>
      <SectionHeader label="Achievements" meta="this week" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {AWARDS.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            style={{ background: 'var(--color-card)', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <span style={{ fontSize: '26px' }}>{a.icon}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', letterSpacing: '1px', color: 'var(--color-wolf)', lineHeight: 1.2 }}>{a.title}</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-mid)', lineHeight: 1.6 }}>{a.desc}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
