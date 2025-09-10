import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { WorkoutFlow } from "@/components/workouts/WorkoutFlow";
import { getWorkoutFull } from "@/lib/workouts-client";
import type { Workout, WorkoutBlock, WorkoutExercise } from "@/types/workout";

export default function ExecuteWorkout() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  useEffect(() => {
    let mounted = true;
    
    async function loadWorkout() {
      if (!id) {
        setError("Geen workout ID gevonden");
        setLoading(false);
        return;
      }

      try {
        console.log('[ExecuteWorkout] Loading workout:', id);
        const data = await getWorkoutFull(id);
        console.log('[ExecuteWorkout] Loaded workout data:', data);
        
        if (!mounted) return;
        
        setWorkout(data.workout);
        setBlocks(data.blocks);
        setExercises(data.exercises);
        setLoading(false);
      } catch (err) {
        console.error('[ExecuteWorkout] Error loading workout:', err);
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Kon workout niet laden");
        setLoading(false);
      }
    }

    loadWorkout();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4">Workout laden...</p>
        </div>
      </div>
    );
  }

  if (error || !workout || !blocks.length || !exercises.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Error</h1>
          <p className="text-gray-600">{error || "Kon workout niet laden"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div>
        <WorkoutFlow 
          workout={workout}
          blocks={blocks}
          exercises={exercises}
        />
        <div className="mt-4 flex justify-end gap-4">
          <div className="flex gap-4">
            <button className="px-4 py-2 rounded-xl border border-neutral-700">Pauze</button>
            <button className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700">Afronden</button>
          </div>
        </div>
      </div>
    </div>
  );
}
