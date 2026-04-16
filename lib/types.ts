// lib/types.ts

export interface DailyMetric {
  date: string
  steps: number
  active_calories: number
  resting_calories: number
  exercise_minutes: number
  resting_heart_rate: number
  hrv_ms: number
  avg_heart_rate: number
  walking_heart_rate: number
  respiratory_rate: number
  wrist_temp_c: number | null
}

export interface Workout {
  date: string
  activity: string
  duration_min: number
  calories: number
  distance_mi: number | null
}

export interface SleepNight {
  night: string
  bedtime: string
  wake_time: string
  total_min: number
  deep_min: number
  rem_min: number
  core_min: number
  awake_min: number
}

export interface VO2Point {
  date: string
  value: number
}

export interface Pushup {
  date: string
  reps: number
}

export interface WeeklySummary {
  steps_total: number
  steps_avg_per_day: number
  active_calories_total: number
  active_calories_avg_per_day: number
  resting_calories_total: number
  resting_calories_avg_per_day: number
  total_calories: number
  exercise_minutes_total: number
  exercise_minutes_avg_per_day: number
  workout_sessions: number
  vo2_max: number
  vo2_max_unit: string
  rhr_avg: number
  hrv_avg_ms: number
}

export interface WeekData {
  athlete: string
  week: string
  generated: string
  source: string
  weekly_summary: WeeklySummary
  daily: DailyMetric[]
  workouts: Workout[]
  sleep: SleepNight[]
  vo2_max_trend: VO2Point[]
  pushups: Pushup[]
  pushups_weekly_total: number
}
