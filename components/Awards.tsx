'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import { IconActivity, IconGolf, IconHeartPulse, IconFlame, IconBicep, IconLightning } from '@/lib/icons'

const AWARDS = [
  { Icon: IconActivity,   color: 'var(--accent-blue)',   title: 'VO₂ MAX PERSONAL BEST',  desc: 'Hit 38.3 mL/kg/min — up from 33.4 in February. 14.7% improvement in 10 weeks.' },
  { Icon: IconGolf,       color: 'var(--accent-green)',  title: 'BIG GOLF WEEK',           desc: '4 rounds logged. Apr 12: 156-minute session burning 1,330 calories. Week\'s biggest single-session burn.' },
  { Icon: IconHeartPulse, color: 'var(--accent-coral)',  title: 'HRV RECOVERY SURGE',      desc: 'HRV climbed from 25 ms (Apr 8) to 71 ms by week\'s end — a 3× improvement signaling strong cardiovascular recovery.' },
  { Icon: IconFlame,      color: 'var(--accent-amber)',  title: '10K STEP DAY',            desc: 'Apr 8 hit 10,445 steps — the week\'s high — combined with 140 minutes of exercise and two workout sessions.' },
  { Icon: IconBicep,      color: 'var(--accent-purple)', title: '140 PUSHUPS THIS WEEK',   desc: '5 sessions, best set at 40 reps on Apr 11. Building consistency in upper body work.' },
  { Icon: IconLightning,  color: 'var(--accent-teal)',   title: '19 WORKOUT SESSIONS',     desc: 'Golf, weight training, walking, yoga, running — 19 logged sessions across 7 active days.' },
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
            className="powo-lift"
            style={{ background: 'var(--color-card)', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            <span style={{ color: a.color }}><a.Icon size={20} /></span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', letterSpacing: '1px', color: a.color, lineHeight: 1.2 }}>{a.title}</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-mid)', lineHeight: 1.5 }}>{a.desc}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
