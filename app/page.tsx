import { weekData } from '@/lib/data'
import Hero from '@/components/Hero'
import WeeklySummary from '@/components/WeeklySummary'
import DailyTable from '@/components/DailyTable'
import WorkoutLog from '@/components/WorkoutLog'
import CardiacMetrics from '@/components/CardiacMetrics'
import VO2Chart from '@/components/VO2Chart'
import SleepAnalysis from '@/components/SleepAnalysis'
import PushupLog from '@/components/PushupLog'
import Awards from '@/components/Awards'
import Footer from '@/components/Footer'

export default function Page() {
  const d = weekData
  return (
    <main style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Hero data={d} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '0 0 40px' }}>
        <WeeklySummary summary={d.weekly_summary} />
        <DailyTable daily={d.daily} />
        <WorkoutLog workouts={d.workouts} />
        <CardiacMetrics daily={d.daily} />
        <VO2Chart trend={d.vo2_max_trend} />
        <SleepAnalysis sleep={d.sleep} />
        <PushupLog pushups={d.pushups} total={d.pushups_weekly_total} />
        <Awards />
      </div>
      <Footer generated={d.generated} week={d.week} />
    </main>
  )
}
