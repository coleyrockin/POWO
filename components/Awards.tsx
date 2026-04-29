'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import { IconActivity, IconGolf, IconHeartPulse, IconFlame, IconBicep, IconLightning } from '@/lib/icons'
import type { HealthData } from '@/lib/types'

interface Props { data: HealthData }

export default function Awards({ data }: Props) {
  const v = data.summary.vo2_max_progression
  const since = ((v.peak.value - v.first.value) / v.first.value) * 100
  const golf = data.workout_summary.find(w => w.type === 'Golf')
  const pickle = data.workout_summary.find(w => w.type === 'Pickleball')
  const skating = data.workout_summary.find(w => w.type === 'Skating')
  const bestStepDate = new Date(data.summary.best_days.max_steps.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const totalKm = Math.round(data.summary.period_totals.total_distance_km)
  const totalKcal = Math.round(data.summary.period_totals.total_active_kcal)

  const AWARDS = [
    { Icon: IconActivity,   color: 'var(--accent-teal)',   title: 'VO₂ MAX PR',
      desc: `Peaked at ${v.peak.value.toFixed(2)} mL/kg/min on ${new Date(v.peak.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}. Up from ${v.first.value.toFixed(1)} on Feb 7 — +${since.toFixed(1)}% across 60 days.` },
    { Icon: IconFlame,      color: 'var(--accent-amber)',  title: '18K STEP DAY',
      desc: `${data.summary.best_days.max_steps.value.toLocaleString()} steps on ${bestStepDate} — 2.4× daily average. Same day: 267 exercise minutes, 2,521 active kcal — full triple PR.` },
    { Icon: IconGolf,       color: 'var(--accent-green)',  title: golf ? `${golf.sessions} GOLF ROUNDS` : 'GOLF MILEAGE',
      desc: golf ? `${Math.round(golf.total_calories).toLocaleString()} kcal across ${Math.round(golf.total_duration_min / 60)} hours of play. Highest-burn activity in the period — true cardio engine.` : '' },
    { Icon: IconLightning,  color: 'var(--accent-coral)',  title: pickle ? `${pickle.sessions} PICKLEBALL SESSIONS` : 'PICKLEBALL VOLUME',
      desc: pickle ? `${Math.round(pickle.total_duration_min / 60)} hours · ${Math.round(pickle.total_calories).toLocaleString()} kcal. Game tempo elevated walking HR consistently above 130 bpm.` : '' },
    { Icon: IconBicep,      color: 'var(--accent-purple)', title: '450+ PUSHUPS',
      desc: 'Logged 450 pushup reps across 4 tracked weeks. Peak week 190 reps · Apr 12–18. Volume reduced last week to protect left shoulder.' },
    { Icon: IconHeartPulse, color: 'var(--accent-blue)',   title: `${totalKm} KM TRAVELED`,
      desc: `${totalKm} km on foot in 91 days · ${totalKcal.toLocaleString()} active kcal burned · ${data.summary.period_totals.total_flights_climbed.toLocaleString()} flights climbed. ${skating ? `${skating.sessions} skate sessions across ${(skating.total_distance_m! / 1000).toFixed(1)} km.` : ''}` },
  ]

  return (
    <section id="awards">
      <SectionHeader label="Achievements" meta="91-day highlights" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {AWARDS.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            className="powo-lift"
            style={{ background: 'var(--color-card)', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <span style={{ color: a.color, lineHeight: 0 }}><a.Icon size={20} /></span>
            <span className={
              a.color === 'var(--accent-blue)'   ? 'powo-glow-blue'   :
              a.color === 'var(--accent-green)'  ? 'powo-glow-green'  :
              a.color === 'var(--accent-amber)'  ? 'powo-glow-amber'  :
              a.color === 'var(--accent-coral)'  ? 'powo-glow-coral'  :
              a.color === 'var(--accent-purple)' ? 'powo-glow-purple' :
              a.color === 'var(--accent-teal)'   ? 'powo-glow-teal'   : ''
            } style={{ fontFamily: 'var(--font-display)', fontSize: '14px', letterSpacing: '0.5px', color: a.color, lineHeight: 1.15 }}>{a.title}</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-mid)', lineHeight: 1.55 }}>{a.desc}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
