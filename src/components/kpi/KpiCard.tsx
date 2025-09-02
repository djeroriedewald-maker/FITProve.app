import { ReactNode } from "react";
import ProgressCircle from "@/components/ui/ProgressCircle";

type Props = {
  icon: ReactNode;
  title: string;
  value: string;
  percent?: number;      // 0..100
  footer?: string;
};

export default function KpiCard({ icon, title, value, percent, footer }: Props) {
  return (
    <div className="card card-hover p-4 flex items-center gap-4 ring-focus">
      <div className="shrink-0">{icon}</div>

      <div className="flex-1 min-w-0">
        <div className="text-sm muted">{title}</div>
        <div className="text-xl font-semibold">{value}</div>
        {footer && <div className="text-xs muted mt-0.5">{footer}</div>}
      </div>

      {typeof percent === "number" && (
        <ProgressCircle value={percent} size={52} strokeWidth={6} />
      )}
    </div>
  );
}
