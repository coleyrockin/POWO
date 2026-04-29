import { healthData } from '@/lib/data'
import ScrollProgress from '@/components/ScrollProgress'
import SectionNav from '@/components/SectionNav'
import Hero from '@/components/Hero'
import ActivityRings from '@/components/ActivityRings'
import WeeklySummary from '@/components/WeeklySummary'
import WeekChange from '@/components/WeekChange'
import DailyTable from '@/components/DailyTable'
import WorkoutLog from '@/components/WorkoutLog'
import CardiacMetrics from '@/components/CardiacMetrics'
import VO2Chart from '@/components/VO2Chart'
import SleepAnalysis from '@/components/SleepAnalysis'
import PushupLog from '@/components/PushupLog'
import RestRecommendation from '@/components/RestRecommendation'
import WorkoutRecommendation from '@/components/WorkoutRecommendation'
import Awards from '@/components/Awards'
import Footer from '@/components/Footer'

export default function Page() {
  const d = healthData
  return (
    <main style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollProgress />
      <Hero data={d} />
      <SectionNav />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '0 0 28px' }}>
        <ActivityRings daily={d.daily} workouts={d.workouts} />
        <WeeklySummary data={d} />
        <WeekChange data={d} />
        <DailyTable daily={d.daily} workouts={d.workouts} />
        <VO2Chart trend={d.vo2_max} />
        <CardiacMetrics data={d} />
        <SleepAnalysis sleep={d.sleep} />
        <WorkoutLog workouts={d.workouts} workoutSummary={d.workout_summary} />
        <PushupLog pushups={d.pushups} />
        <RestRecommendation data={d} />
        <WorkoutRecommendation data={d} />
        <Awards data={d} />
      </div>
      <Footer generated={d.meta.generated_at} period={`${d.meta.period.start} → ${d.meta.period.end}`} />
    </main>
  )
}
