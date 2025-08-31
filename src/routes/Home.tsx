import KpiCard from "../components/kpi/KpiCard";
import { Flame, Footprints, HeartPulse, Timer } from "lucide-react";

export default function Home() {
  const loading = false;
  const data = {
    calories: 450,
    steps: 10250,
    workoutMin: 45,
    heartRate: 145,
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div
        className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
        aria-label="Daily KPIs"
      >
        <KpiCard
          title="Calories"
          value={loading ? null : data.calories}
          unit="kcal"
          progress={45}
          loading={loading}
          icon={<Flame className="w-5 h-5 text-orange-500" />}
        />
        <KpiCard
          title="Steps"
          value={loading ? null : data.steps.toLocaleString()}
          progress={85}
          loading={loading}
          icon={<Footprints className="w-5 h-5 text-orange-500" />}
        />
        <KpiCard
          title="Workout time"
          value={loading ? null : data.workoutMin}
          unit="min"
          progress={60}
          loading={loading}
          icon={<Timer className="w-5 h-5 text-orange-500" />}
        />
        <KpiCard
          title="Heart rate"
          value={loading ? null : data.heartRate}
          unit="bpm"
          progress={72}
          loading={loading}
          icon={<HeartPulse className="w-5 h-5 text-orange-500" />}
        />
      </div>
    </div>
  );
}
