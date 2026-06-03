import type {
  DailyMetric,
  HealthData,
  MonthlyStats,
  PushupWeek,
  SleepData,
  SleepNight,
  Summary,
  VO2Point,
  Workout,
  WorkoutTypeSummary,
} from './types'
import type {
  ImportedDailyMetric,
  ImportedHealthExport,
  ImportedSleepNight,
  ImportedWorkout,
} from './imported-health-export'

function round(value: number, digits = 1): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

function numericValues(values: (number | null | undefined)[]): number[] {
  return values.filter((value): value is number => typeof value === 'number')
}

function sum(values: (number | null | undefined)[]): number {
  return numericValues(values).reduce((total, value) => total + value, 0)
}

function avg(values: (number | null | undefined)[]): number {
  const numbers = numericValues(values)
  if (numbers.length === 0) return 0
  return sum(numbers) / numbers.length
}

function maxMetric(days: DailyMetric[], key: keyof Pick<DailyMetric, 'steps' | 'active_kcal' | 'exercise_min'>) {
  const withValues = days.filter(day => typeof day[key] === 'number')
  return withValues.reduce((best, day) => {
    const value = day[key] as number
    return value > best.value ? { date: day.date, value } : best
  }, { date: withValues[0]?.date ?? days[0]?.date ?? '', value: Number.NEGATIVE_INFINITY })
}

function mapDailyOverride(day: ImportedDailyMetric): DailyMetric {
  const active = day.active_calories_kcal
  const basal = day.resting_calories_kcal

  return {
    date: day.date,
    steps: day.steps,
    active_kcal: active,
    basal_kcal: basal,
    total_kcal: active !== null && basal !== null ? round(active + basal) : null,
    distance_m: round(day.walking_running_distance_km * 1000),
    exercise_min: day.exercise_minutes,
    stand_min: null,
    flights_climbed: day.flights_climbed,
    daylight_sec: null,
    avg_hr: day.heart_rate_avg_bpm,
    resting_hr: day.resting_heart_rate_bpm,
    hrv_ms: day.hrv_sdnn_ms,
    walking_hr: day.walking_hr_avg_bpm,
    respiratory_rate: day.respiratory_rate_brpm,
    spo2_pct: day.blood_oxygen_pct,
  }
}

// The 6-month export is the complete dataset (no base-carry / signal-shift).
function buildDaily(latest: ImportedHealthExport): DailyMetric[] {
  return latest.dailyOverrides
    .map(mapDailyOverride)
    .filter(day => day.date >= latest.period.start && day.date <= latest.period.end)
    .sort((a, b) => a.date.localeCompare(b.date))
}

function normalizeWorkoutType(type: string): string {
  if (type === 'Other' || type === 'Unknown Activity') return 'Pickleball'
  if (type === 'Paddle Sports') return 'Paddling'
  if (type === 'Skateboarding' || type === 'Skating Sports') return 'Skating'
  return type
}

function mapWorkout(workout: ImportedWorkout): Workout {
  return {
    date: workout.start.slice(0, 10),
    start: workout.start,
    end: workout.end,
    type: normalizeWorkoutType(workout.activity_type),
    duration_min: workout.duration_min,
    distance_m: workout.distance_km === null ? null : round(workout.distance_km * 1000),
    calories: workout.calories,
  }
}

function buildWorkouts(latest: ImportedHealthExport): Workout[] {
  return latest.workouts.map(mapWorkout).sort((a, b) => b.start.localeCompare(a.start))
}

function buildVO2(latest: ImportedHealthExport): VO2Point[] {
  return latest.vo2Max.map(point => ({ date: point.date, value: point.value_ml_kg_min }))
}

function buildWorkoutSummary(workouts: Workout[]): WorkoutTypeSummary[] {
  const groups = new Map<string, WorkoutTypeSummary>()

  for (const workout of workouts) {
    const current = groups.get(workout.type) ?? {
      type: workout.type,
      sessions: 0,
      total_duration_min: 0,
      total_calories: 0,
      total_distance_m: workout.distance_m === null ? null : 0,
    }

    current.sessions += 1
    current.total_duration_min = round(current.total_duration_min + workout.duration_min)
    current.total_calories = round(current.total_calories + workout.calories)
    if (workout.distance_m !== null) {
      current.total_distance_m = round((current.total_distance_m ?? 0) + workout.distance_m)
    }

    groups.set(workout.type, current)
  }

  return [...groups.values()].sort((a, b) => b.sessions - a.sessions)
}

function daysInclusive(start: string, end: string): number {
  const first = new Date(`${start}T00:00:00`).getTime()
  const last = new Date(`${end}T00:00:00`).getTime()
  return Math.round((last - first) / 86_400_000) + 1
}

function buildSummary(daily: DailyMetric[], workouts: Workout[], vo2Max: VO2Point[]): Summary {
  const totalSteps = sum(daily.map(day => day.steps))
  const totalActive = sum(daily.map(day => day.active_kcal))
  const totalExercise = sum(daily.map(day => day.exercise_min))
  const totalDistanceKm = sum(daily.map(day => day.distance_m)) / 1000
  const first = vo2Max[0]
  const current = vo2Max[vo2Max.length - 1]
  const peak = vo2Max.reduce((best, point) => point.value > best.value ? point : best, first)

  return {
    period_totals: {
      total_steps: Math.round(totalSteps),
      total_active_kcal: round(totalActive),
      total_exercise_min: Math.round(totalExercise),
      total_distance_km: round(totalDistanceKm, 2),
      total_workouts: workouts.length,
      total_flights_climbed: Math.round(sum(daily.map(day => day.flights_climbed))),
    },
    averages: {
      avg_daily_steps: daily.length > 0 ? Math.round(totalSteps / daily.length) : 0,
      avg_active_kcal: round(avg(daily.map(day => day.active_kcal))),
      avg_resting_hr: round(avg(daily.map(day => day.resting_hr))),
      avg_hrv_ms: round(avg(daily.map(day => day.hrv_ms))),
      avg_exercise_min: round(avg(daily.map(day => day.exercise_min))),
    },
    best_days: {
      max_steps: maxMetric(daily, 'steps'),
      max_active_kcal: maxMetric(daily, 'active_kcal'),
      max_exercise_min: maxMetric(daily, 'exercise_min'),
    },
    vo2_max_progression: { first, peak, current },
  }
}

function buildMonthly(daily: DailyMetric[]): Record<string, MonthlyStats> {
  const groups = new Map<string, DailyMetric[]>()

  for (const day of daily) {
    const key = day.date.slice(0, 7)
    groups.set(key, [...(groups.get(key) ?? []), day])
  }

  return Object.fromEntries([...groups.entries()].map(([month, days]) => [
    month,
    {
      days_with_data: days.length,
      total_steps: Math.round(sum(days.map(day => day.steps))),
      avg_steps: days.length > 0 ? Math.round(sum(days.map(day => day.steps)) / days.length) : 0,
      total_active_kcal: round(sum(days.map(day => day.active_kcal))),
      avg_active_kcal: round(avg(days.map(day => day.active_kcal))),
      total_exercise_min: Math.round(sum(days.map(day => day.exercise_min))),
      total_distance_km: round(sum(days.map(day => day.distance_m)) / 1000, 2),
      avg_resting_hr: round(avg(days.map(day => day.resting_hr))),
      avg_hrv: round(avg(days.map(day => day.hrv_ms))),
    },
  ]))
}

function buildPushupWeeks(latest: ImportedHealthExport): PushupWeek[] {
  return latest.pushupsManualLog.weekly.map(week => ({
    week: week.week.replace(' to ', '/'),
    total: week.total,
    sessions: week.sessions,
    notes: week.note,
  }))
}

// ── Sleep (duration/timing — no stage segments in this export) ──
function hmToMin(hm: string): number {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}
function minToHM(min: number): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
function median(xs: number[]): number {
  if (xs.length === 0) return 0
  const s = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}
// Circular median for clock times that wrap midnight: shift evening hours
// (>=18:00) to negative so a 23:30 / 00:30 cluster centers on midnight, not noon.
function typicalClock(hms: string[]): string {
  if (hms.length === 0) return ''
  return minToHM(median(hms.map(hmToMin).map(m => (m >= 18 * 60 ? m - 1440 : m))))
}

function buildSleep(latest: ImportedHealthExport): SleepData {
  const nights: SleepNight[] = latest.sleep
    .map((n: ImportedSleepNight) => {
      const bedHour = hmToMin(n.bedtime_local) / 60
      // Short or clearly daytime sessions are naps, excluded from nightly stats.
      const isNap = n.total_in_bed_min < 180 || (bedHour >= 6 && bedHour < 18)
      return {
        date: n.wake_date,
        in_bed_hours: round(n.total_in_bed_min / 60, 2),
        bedtime_local: n.bedtime_local,
        wake_time_local: n.wake_time_local,
        isNap,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const real = nights.filter(n => !n.isNap)
  const hours = real.map(n => n.in_bed_hours)
  const mean = hours.length ? sum(hours) / hours.length : 0
  const variance = hours.length ? sum(hours.map(h => (h - mean) ** 2)) / hours.length : 0

  return {
    nights,
    coverage_note: latest.sleepCoverage,
    summary: {
      nights_with_data: real.length,
      avg_in_bed_hours: round(mean, 2),
      min_in_bed_hours: hours.length ? round(Math.min(...hours), 2) : 0,
      max_in_bed_hours: hours.length ? round(Math.max(...hours), 2) : 0,
      stdev_hours: round(Math.sqrt(variance), 2),
      typical_bedtime: typicalClock(real.map(n => n.bedtime_local)),
      typical_wake: minToHM(median(real.map(n => hmToMin(n.wake_time_local)))),
      naps: nights.length - real.length,
    },
  }
}

export function normalizeHealthExport(base: HealthData, latest: ImportedHealthExport): HealthData {
  const daily = buildDaily(latest)
  const workouts = buildWorkouts(latest)
  const vo2Max = buildVO2(latest)
  const days = daysInclusive(latest.period.start, latest.period.end)
  const weightKg = round(latest.bodyMeasurement.weight_kg, 2)
  const weightLbs = Math.round(weightKg * 2.20462)
  const workoutSummary = buildWorkoutSummary(workouts)

  return {
    ...base,
    meta: {
      ...base.meta,
      generated_at: `${latest.export_date}T00:00:00-05:00`,
      source: latest.source,
      period: { start: latest.period.start, end: latest.period.end, days },
      notes: [
        `Latest export from ${latest.generatedBy}; timezone ${latest.timezone}.`,
        `Weight reading: ${weightKg} kg (${weightLbs} lbs) on ${latest.bodyMeasurement.measured_date}.`,
        latest.bodyMeasurement.note,
        'Workout types normalized: Unknown Activity/Other -> Pickleball, Paddle Sports -> Paddling, Skating Sports/Skateboarding -> Skating.',
        latest.pushupsManualLog.note,
      ].join(' '),
    },
    profile: {
      ...base.profile,
      weight_kg: weightKg,
      weight_lbs: weightLbs,
      weight_date: latest.bodyMeasurement.measured_date,
    },
    summary: buildSummary(daily, workouts, vo2Max),
    monthly: buildMonthly(daily),
    daily,
    vo2_max: vo2Max,
    workouts,
    workout_summary: workoutSummary,
    pushups: {
      unit: 'reps',
      weeks: buildPushupWeeks(latest),
    },
    sleep: buildSleep(latest),
  }
}
