// lib/workout-recommendation.ts — recovery-led 7-day training cycle.
// Extracted from helpers.ts (keeps helpers under the ~800-line ceiling); pure
// move, no logic change. Uses the recovery/sleep/vo2 analyzers from helpers.
import type { HealthData } from "./types"
import { analyzeRecovery, analyzeSleep, vo2Recent } from "./helpers"

// ─── Workout recommendation ──────────────────────────────────────
export interface WorkoutBlock {
  name: string
  sets?: string
  detail: string
  intensity: 'low' | 'mod' | 'high'
}

export interface WorkoutDay {
  day: string
  focus: string
  zone: string
  duration_min: number
  blocks: WorkoutBlock[]
  rationale: string
  shoulder_safe: boolean
  cites?: string[]  // user constraints / data points the day addresses
}

export interface WorkoutRecommendation {
  cycle_name: string
  rationale: string
  start_date: string
  end_date: string
  weekly_volume_min: number
  days: WorkoutDay[]
  guardrails: string[]
}

export function buildWorkoutRecommendation(data: HealthData): WorkoutRecommendation {
  // Recovery-led 7-day cycle anchored to the dataset, not render time.
  const start = new Date(`${data.meta.period.end}T00:00:00`)
  start.setDate(start.getDate() + 1)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const recovery = analyzeRecovery(data)
  const sleep = analyzeSleep(data)
  const vo2 = vo2Recent(data.vo2_max)
  const golf = data.workout_summary.find(workout => workout.type === 'Golf')
  const pickleball = data.workout_summary.find(workout => workout.type === 'Pickleball')
  const golfSessions = data.workouts.filter(workout => workout.type === 'Golf')
  const bestGolfSession = golfSessions.length > 0
    ? golfSessions.reduce((best, workout) => (workout.calories > best.calories ? workout : best))
    : null
  const latestPushupWeek = data.pushups.weeks[data.pushups.weeks.length - 1]
  const priorPushupWeek = data.pushups.weeks[data.pushups.weeks.length - 2]
  const golfHours = golf ? (golf.total_duration_min / 60).toFixed(1) : null
  const pickleballMinutes = pickleball ? Math.round(pickleball.total_duration_min).toLocaleString() : null

  const days: WorkoutDay[] = [
    {
      day: 'Day 1',
      focus: 'Active Recovery + Mobility',
      zone: 'Z1 · sub-110 bpm',
      duration_min: 50,
      shoulder_safe: true,
      rationale: 'Re-set autonomic balance. Move blood, no metabolic stress.',
      cites: [`VO₂ ${recovery.vo2DeltaPct.toFixed(1)}% off ${fmt(new Date(`${vo2.peak.date}T00:00:00`))} peak`, `RHR +${(recovery.rhrDelta ?? 0).toFixed(1)} bpm above baseline`],
      blocks: [
        { name: 'Walk — outdoor', detail: '40 min · Z1 · sun on skin first 20 min', intensity: 'low' },
        { name: 'Mobility flow', detail: 'Shoulder CARs · thoracic openers · 90/90 hip · couch stretch', intensity: 'low' },
      ],
    },
    {
      day: 'Day 2',
      focus: 'Lower Body Strength',
      zone: 'Z2 · 110–130 bpm',
      duration_min: 55,
      shoulder_safe: true,
      rationale: 'Lower body responds well to load and is unaffected by shoulder. Pattern hip hinge + squat.',
      cites: ['Honors: left shoulder internal rotation pain', 'Honors: left hip discomfort — moderate, not maximal load'],
      blocks: [
        { name: 'Goblet squat',     sets: '4 × 8',  detail: '44 lb barbell front-loaded · 2 sec descent · full ROM', intensity: 'mod' },
        { name: 'Romanian deadlift', sets: '4 × 8',  detail: 'Slow eccentric · neutral spine · stretch hamstrings', intensity: 'mod' },
        { name: 'Reverse lunge',    sets: '3 × 10/leg', detail: 'Bodyweight or barbell · drive through front heel', intensity: 'mod' },
        { name: 'Pallof press',     sets: '3 × 10/side', detail: 'Anti-rotation core · band or cable', intensity: 'low' },
        { name: 'Hanging knee raise', sets: '3 × 8', detail: 'Slow controlled · hollow body finish', intensity: 'mod' },
      ],
    },
    {
      day: 'Day 3',
      focus: 'Skill + Aerobic Base',
      zone: 'Z2-3 · 120–145 bpm',
      duration_min: 75,
      shoulder_safe: true,
      rationale: 'Pickleball is your highest-frequency court activity. Train it, but cap intensity to spare shoulder.',
      cites: pickleball ? [`${pickleball.sessions} pickleball sessions logged this period (${pickleballMinutes} min)`, 'Honors: left shoulder — drilling only, no slams'] : ['Honors: left shoulder — drilling only, no slams'],
      blocks: [
        { name: 'Pickleball (drilling)', detail: '45 min · dink rallies · third-shot drops · no slams', intensity: 'mod' },
        { name: 'Walk cooldown',         detail: '20 min · Z1 · breathe nasal-only', intensity: 'low' },
        { name: 'Rotator cuff prehab',   detail: '3 × 12 banded ER · 3 × 12 face-pulls · LIGHT', intensity: 'low' },
      ],
    },
    {
      day: 'Day 4',
      focus: 'Upper Pull + Shoulder-Safe Push',
      zone: 'Z2 · 110–130 bpm',
      duration_min: 50,
      shoulder_safe: true,
      rationale: 'Build pulling strength to balance posture. Avoid loaded internal rotation entirely.',
      cites: latestPushupWeek && priorPushupWeek ? ['Honors: left shoulder internal rotation pain — no overhead pressing', `Pushup volume reduced this week (${latestPushupWeek.total} vs ${priorPushupWeek.total} prior)`] : ['Honors: left shoulder internal rotation pain — no overhead pressing'],
      blocks: [
        { name: 'Bent-over row',     sets: '4 × 8',  detail: '44 lb barbell · pull to lower ribs · pause 1 sec', intensity: 'mod' },
        { name: 'Floor press',       sets: '3 × 8',  detail: 'Neutral grip · floor protects shoulder ROM', intensity: 'mod' },
        { name: 'Barbell curl',      sets: '3 × 10', detail: 'Slow controlled · no swing', intensity: 'mod' },
        { name: 'Wall slides',       sets: '3 × 10', detail: 'Scap upward rotation drill', intensity: 'low' },
        { name: 'Pushups (modified)', sets: '3 × max comfortable', detail: 'Stop 2 reps shy of failure · pain-free range', intensity: 'mod' },
      ],
    },
    {
      day: 'Day 5',
      focus: 'Yoga + Long Walk',
      zone: 'Z1 · sub-110 bpm',
      duration_min: 60,
      shoulder_safe: true,
      rationale: 'Parasympathetic day. Drives HRV up before weekend output.',
      cites: [`Sleep avg ${sleep.avgHours.toFixed(1)}h · ${sleep.consistency} consistency`, `Sleep stdev ±${sleep.variability.toFixed(2)}h`],
      blocks: [
        { name: 'Yoga flow',  detail: '30 min · slow pace · hold poses 5 breaths · hip + thoracic focus', intensity: 'low' },
        { name: 'Walk',       detail: '30 min · outdoor · phone-free', intensity: 'low' },
      ],
    },
    {
      day: 'Day 6',
      focus: 'Golf — Aerobic Game',
      zone: 'Z2 · 100–130 bpm',
      duration_min: 180,
      shoulder_safe: true,
      rationale: golf ? `Golf has been your top calorie engine (${Math.round(golf.total_calories).toLocaleString()} kcal across ${golf.sessions} rounds). Walk the course.` : 'Golf has been your top calorie engine. Walk the course.',
      cites: golf && bestGolfSession ? [`${golf.sessions} rounds · ${Math.round(golf.total_calories).toLocaleString()} kcal · ${golfHours} hrs played`, `Highest single-day burn was a ${Math.round(bestGolfSession.calories).toLocaleString()} kcal round (${fmt(new Date(`${bestGolfSession.date}T00:00:00`))})`] : [],
      blocks: [
        { name: 'Walking 18',     detail: '~10k steps · push cart > riding · keep effort steady', intensity: 'mod' },
        { name: 'Hydration',      detail: '24 oz water + electrolytes per 9', intensity: 'low' },
      ],
    },
    {
      day: 'Day 7',
      focus: 'Lower-Body Power + Core',
      zone: 'Z3 · 130–150 bpm peaks',
      duration_min: 50,
      shoulder_safe: true,
      rationale: 'Re-introduce a power stimulus. Short, sharp, fully recovered between sets.',
      cites: [`Re-test VO₂ next reading — looking for rebound from ${vo2.current.value.toFixed(2)}`],
      blocks: [
        { name: 'Front squat',         sets: '4 × 6',  detail: 'Slightly heavier than goblet · clean elbows', intensity: 'high' },
        { name: 'Single-leg RDL',      sets: '3 × 6/leg', detail: 'Balance challenge · light load', intensity: 'mod' },
        { name: 'Box jump or step-up', sets: '4 × 5', detail: 'Explosive · full reset between reps', intensity: 'high' },
        { name: 'Side plank',          sets: '3 × 30 s/side', detail: 'Stack hips · ribs down', intensity: 'mod' },
        { name: 'Stair sprints',       sets: '6 × 30 s', detail: '90 s rest · cap effort at 80%', intensity: 'high' },
      ],
    },
  ]

  const guardrails = [
    'No loaded overhead pressing for the full cycle',
    'No max-effort pushup sets — protect shoulder',
    'Cap pickleball at drilling, not competitive games',
    'If RHR > 70 bpm at wake, downgrade that day to mobility only',
    'Walk barefoot post-workout to decompress feet/ankles',
    'Re-test VO₂ trend after Day 7 — expect rebound',
  ]

  const weekly_volume_min = days.reduce((a, d) => a + d.duration_min, 0)

  return {
    cycle_name: 'Recovery-Led Build · Week 1',
    rationale:
      `Built around your ${data.meta.period.days}-day load: huge aerobic base from walking/golf/pickleball, but VO₂ rolling off peak and shoulder flagged. ` +
      'This cycle protects the shoulder, defends sleep, and reintroduces lower-body strength + power without spiking systemic load.',
    start_date: fmt(start),
    end_date: fmt(end),
    weekly_volume_min,
    days,
    guardrails,
  }
}
