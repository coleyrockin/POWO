// lib/data.ts
import type { WeekData } from './types'

export const weekData: WeekData = {
  athlete: 'Coley',
  week: '2026-04-08 to 2026-04-14',
  generated: '2026-04-15',
  source: 'Apple HealthKit',

  weekly_summary: {
    steps_total: 54071,
    steps_avg_per_day: 7724,
    active_calories_total: 6696,
    active_calories_avg_per_day: 957,
    resting_calories_total: 14015,
    resting_calories_avg_per_day: 2002,
    total_calories: 20711,
    exercise_minutes_total: 616,
    exercise_minutes_avg_per_day: 88,
    workout_sessions: 18,
    vo2_max: 38.33,
    vo2_max_unit: 'mL/kg/min',
    rhr_avg: 65,
    hrv_avg_ms: 55,
  },

  daily: [
    { date: '2026-04-08', steps: 10445, active_calories: 1301, resting_calories: 2022, exercise_minutes: 140, resting_heart_rate: 72, hrv_ms: 25,  avg_heart_rate: 105, walking_heart_rate: 98,  respiratory_rate: 15.3, wrist_temp_c: 35.21 },
    { date: '2026-04-09', steps: 4729,  active_calories: 577,  resting_calories: 1961, exercise_minutes: 48,  resting_heart_rate: 55, hrv_ms: 59,  avg_heart_rate: 76,  walking_heart_rate: 92,  respiratory_rate: 13.5, wrist_temp_c: null  },
    { date: '2026-04-10', steps: 6999,  active_calories: 688,  resting_calories: 1998, exercise_minutes: 61,  resting_heart_rate: 60, hrv_ms: 42,  avg_heart_rate: 86,  walking_heart_rate: 94,  respiratory_rate: 16.3, wrist_temp_c: 35.19 },
    { date: '2026-04-11', steps: 9540,  active_calories: 984,  resting_calories: 1990, exercise_minutes: 81,  resting_heart_rate: 56, hrv_ms: 68,  avg_heart_rate: 84,  walking_heart_rate: 147, respiratory_rate: 13.6, wrist_temp_c: null  },
    { date: '2026-04-12', steps: 8376,  active_calories: 1612, resting_calories: 1992, exercise_minutes: 165, resting_heart_rate: 75, hrv_ms: 47,  avg_heart_rate: 111, walking_heart_rate: 106, respiratory_rate: 15.4, wrist_temp_c: 35.19 },
    { date: '2026-04-13', steps: 9232,  active_calories: 1031, resting_calories: 2023, exercise_minutes: 104, resting_heart_rate: 68, hrv_ms: 71,  avg_heart_rate: 84,  walking_heart_rate: 109, respiratory_rate: 14.5, wrist_temp_c: 35.35 },
    { date: '2026-04-14', steps: 4750,  active_calories: 503,  resting_calories: 2029, exercise_minutes: 17,  resting_heart_rate: 67, hrv_ms: 71,  avg_heart_rate: 75,  walking_heart_rate: 106, respiratory_rate: 14.9, wrist_temp_c: 34.95 },
  ],

  workouts: [
    { date: '2026-04-08', activity: 'Walking',          duration_min: 18,  calories: 103,  distance_mi: 1.06 },
    { date: '2026-04-08', activity: 'Weight Training',  duration_min: 14,  calories: 88,   distance_mi: null },
    { date: '2026-04-08', activity: 'Golf',             duration_min: 54,  calories: 399,  distance_mi: 0.73 },
    { date: '2026-04-08', activity: 'Unknown Activity', duration_min: 28,  calories: 279,  distance_mi: null },
    { date: '2026-04-09', activity: 'Weight Training',  duration_min: 15,  calories: 75,   distance_mi: null },
    { date: '2026-04-09', activity: 'Weight Training',  duration_min: 8,   calories: 70,   distance_mi: null },
    { date: '2026-04-10', activity: 'Weight Training',  duration_min: 8,   calories: 70,   distance_mi: null },
    { date: '2026-04-10', activity: 'Weight Training',  duration_min: 2,   calories: 7,    distance_mi: null },
    { date: '2026-04-11', activity: 'Weight Training',  duration_min: 12,  calories: 95,   distance_mi: null },
    { date: '2026-04-11', activity: 'Walking',          duration_min: 1,   calories: 9,    distance_mi: 0.08 },
    { date: '2026-04-11', activity: 'Weight Training',  duration_min: 2,   calories: 14,   distance_mi: null },
    { date: '2026-04-11', activity: 'Running',          duration_min: 2,   calories: 25,   distance_mi: 0.21 },
    { date: '2026-04-11', activity: 'Walking',          duration_min: 34,  calories: 384,  distance_mi: 2.04 },
    { date: '2026-04-11', activity: 'Golf',             duration_min: 42,  calories: 205,  distance_mi: 0.35 },
    { date: '2026-04-12', activity: 'Golf',             duration_min: 156, calories: 1330, distance_mi: 2.29 },
    { date: '2026-04-13', activity: 'Weight Training',  duration_min: 12,  calories: 88,   distance_mi: null },
    { date: '2026-04-13', activity: 'Weight Training',  duration_min: 5,   calories: 30,   distance_mi: null },
    { date: '2026-04-13', activity: 'Golf',             duration_min: 51,  calories: 328,  distance_mi: 0.65 },
  ],

  sleep: [
    { night: '2026-04-08 to 2026-04-09', bedtime: '12:17 AM', wake_time: '10:19 AM', total_min: 602, deep_min: 39,  rem_min: 146, core_min: 376, awake_min: 41 },
    { night: '2026-04-10 to 2026-04-11', bedtime: '11:49 PM', wake_time: '09:01 AM', total_min: 552, deep_min: 26,  rem_min: 136, core_min: 349, awake_min: 41 },
    { night: '2026-04-12 to 2026-04-13', bedtime: '11:37 PM', wake_time: '09:24 AM', total_min: 587, deep_min: 31,  rem_min: 104, core_min: 411, awake_min: 41 },
    { night: '2026-04-13 to 2026-04-14', bedtime: '12:18 AM', wake_time: '08:05 AM', total_min: 467, deep_min: 49,  rem_min: 127, core_min: 251, awake_min: 40 },
  ],

  vo2_max_trend: [
    { date: '2026-02-01', value: 33.4  },
    { date: '2026-02-08', value: 34.62 },
    { date: '2026-02-15', value: 35.04 },
    { date: '2026-02-22', value: 35.82 },
    { date: '2026-03-01', value: 35.44 },
    { date: '2026-03-08', value: 35.69 },
    { date: '2026-04-12', value: 38.33 },
  ],

  pushups: [
    { date: '2026-04-06', reps: 30 },
    { date: '2026-04-08', reps: 30 },
    { date: '2026-04-10', reps: 20 },
    { date: '2026-04-11', reps: 40 },
  ],
  pushups_weekly_total: 120,
}

export const ACTIVITY_ICONS: Record<string, string> = {
  'Walking':          '🚶',
  'Running':          '🏃',
  'Weight Training':  '🏋️',
  'Golf':             '⛳',
  'Hiking':           '🥾',
  'Yoga':             '🧘',
  'Core Training':    '💪',
  'Stair Climbing':   '🪜',
  'Skating':          '⛸️',
  'Unknown Activity': '❓',
}
