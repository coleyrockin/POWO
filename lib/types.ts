// lib/types.ts — POWO 91-day schema (v2)

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

export interface SleepNight {
  date: string
  total_sleep_hours: number
  core_hours: number
  deep_hours: number
  rem_hours: number
  deep_pct: number
  rem_pct: number
}

export interface SleepSummary {
  nights_with_data: number
  avg_total_hours: number
  min_total_hours: number
  max_total_hours: number
  stdev_hours: number
  avg_deep_pct: number
  avg_rem_pct: number
  avg_deep_hours: number
  avg_rem_hours: number
}

export interface SleepData {
  nights: SleepNight[]
  coverage_note: string
  summary: SleepSummary
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
