import { Flame, Footprints, Timer, HeartPulse } from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
export default function Home() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Home</h2>
      <div className="grid grid-cols-1 gap-4">
        <KpiCard icon={<Flame />} title="Calories" value="450 kcal" percent={45} footer="Goal progress" />
        <KpiCard icon={<Footprints />} title="Steps" value="10,250" percent={85} footer="Daily target" />
        <KpiCard icon={<Timer />} title="Workout time" value="45 min" percent={60} footer="This week" />
        <KpiCard icon={<HeartPulse />} title="Heart rate" value="145 bpm" percent={72} footer="Avg session" />
      </div>
    </div>
  );
}
