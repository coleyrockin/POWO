// lib/types.ts — POWO health schema (v3)

export interface Meta {
  owner: string
  generated_at: string
  source: string
  period: { start: string; end: string; days: number }
  schema_version: string
  notes: string
}

export interface Profile {
  age_band: string
  primary_goal: string
  weight_kg: number
  weight_lbs: number
  weight_date: string
  active_lifestyle: string[]
  training_focus: string
  current_constraints: string[]
  equipment: string[]
}

export interface PeriodTotals {
  total_steps: number
  total_active_kcal: number
  total_exercise_min: number
  total_distance_km: number
  total_workouts: number
  total_flights_climbed: number
}

export interface PeriodAverages {
  avg_daily_steps: number
  avg_active_kcal: number
  avg_resting_hr: number
  avg_hrv_ms: number
  avg_exercise_min: number
}

export interface BestDay { date: string; value: number }

export interface VO2Progression {
  first: BestDay
  peak: BestDay
  current: BestDay
}

export interface Summary {
  period_totals: PeriodTotals
  averages: PeriodAverages
  best_days: {
    max_steps: BestDay
    max_active_kcal: BestDay
    max_exercise_min: BestDay
  }
  vo2_max_progression: VO2Progression
}

export interface MonthlyStats {
  days_with_data: number
  total_steps: number
  avg_steps: number
  total_active_kcal: number
  avg_active_kcal: number
  total_exercise_min: number
  total_distance_km: number
  avg_resting_hr: number
  avg_hrv: number
}

export interface DailyMetric {
  date: string
  steps: number
  active_kcal: number | null
  basal_kcal: number | null
  total_kcal: number | null
  distance_m: number
  exercise_min: number | null
  stand_min: number | null
  flights_climbed: number
  daylight_sec: number | null
  avg_hr: number | null
  resting_hr: number | null
  hrv_ms: number | null
  walking_hr: number | null
  respiratory_rate: number | null
  spo2_pct: number | null
}

export interface VO2Point { date: string; value: number }

export interface Workout {
  date: string
  start: string
  end: string
  type: string
  duration_min: number
  distance_m: number | null
  calories: number
}

export interface WorkoutTypeSummary {
  type: string
  sessions: number
  total_duration_min: number
  total_calories: number
  total_distance_m: number | null
}

export interface PushupSession {
  date: string
  reps: number
  session_breakdown?: number[]
}

export interface PushupWeek {
  week: string
  total: number
  sessions: PushupSession[]
  notes?: string
}

export interface PushupData {
  unit: string
  weeks: PushupWeek[]
}

// Duration/timing sleep model. The source export provides in-bed duration +
// bed/wake clock times (no Core/Deep/REM stage segments), so the dashboard is
// built around how long and how regularly sleep happens.
export interface SleepNight {
  date: string            // wake date (YYYY-MM-DD)
  in_bed_hours: number    // total in-bed span (includes brief wakes)
  bedtime_local: string   // "HH:MM" local
  wake_time_local: string // "HH:MM" local
  isNap: boolean          // short/daytime entry, excluded from nightly stats
}

export interface SleepSummary {
  nights_with_data: number  // real nights (naps excluded)
  avg_in_bed_hours: number
  min_in_bed_hours: number
  max_in_bed_hours: number
  stdev_hours: number       // duration consistency
  typical_bedtime: string   // "HH:MM" median bedtime
  typical_wake: string      // "HH:MM" median wake
  naps: number
}

export interface SleepData {
  nights: SleepNight[]
  coverage_note: string
  summary: SleepSummary
}

export type ActivityBucket = 0 | 1 | 2 | 3 | 4

export interface DayConsistency {
  date: string
  bucket: ActivityBucket
  exerciseMin: number | null
  activeKcal: number | null
  workoutCount: number
  isPartial: boolean
}

export interface ConsistencyResult {
  days: DayConsistency[]
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  pctActive: number
}

export interface HealthData {
  meta: Meta
  profile: Profile
  summary: Summary
  monthly: Record<string, MonthlyStats>
  daily: DailyMetric[]
  vo2_max: VO2Point[]
  workouts: Workout[]
  workout_summary: WorkoutTypeSummary[]
  pushups: PushupData
  sleep: SleepData
}
