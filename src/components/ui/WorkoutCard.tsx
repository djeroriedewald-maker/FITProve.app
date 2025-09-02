import React from "react";
import { Clock } from "lucide-react";

export type Workout = {
  id: string;
  title: string;
  duration: string;   // e.g. "20 min"
  level: "Beginner" | "Intermediate" | "Advanced";
};

type WorkoutCardProps = {
  workout: Workout;
  onClick?: (w: Workout) => void;
};

export default function WorkoutCard({ workout, onClick }: WorkoutCardProps) {
  return (
    <button
      className="card w-full text-left transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      onClick={() => onClick?.(workout)}
    >
      <div className="card-body">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-medium">{workout.title}</h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Clock className="size-4" />
              <span>{workout.duration}</span>
              <span>•</span>
              <span>{workout.level}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
