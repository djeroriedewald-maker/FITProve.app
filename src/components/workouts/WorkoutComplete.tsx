import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Workout, SetLog } from '@/types/workout';
import { completeSession, listSessionSets } from '@/lib/workouts-client';

interface WorkoutCompleteProps {
  workout: Workout;
  sessionId: string;
  duration: number;
}

export function WorkoutComplete({ workout, sessionId, duration }: WorkoutCompleteProps) {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<SetLog[]>([]);
  
  useEffect(() => {
    // Laad alle logs van deze sessie
    async function loadSessionLogs() {
      try {
        const sessionLogs = await listSessionSets(sessionId);
        setLogs(sessionLogs);
      } catch (error) {
        console.error('Error loading session logs:', error);
      }
    }
    loadSessionLogs();
  }, [sessionId]);

  // Format duration naar mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-block p-4 rounded-full bg-green-100 mb-4">
          <svg 
            className="w-12 h-12 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">
          Workout voltooid!
        </h1>
        <p className="text-gray-600">
          Je hebt {workout.title} afgerond in {formatDuration(duration)}
        </p>
      </div>

      {/* Workout samenvatting */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Samenvatting</h2>
        
        <div className="space-y-4">
          {logs.map((log, i) => (
            <div key={i} className="border-b pb-4 last:border-b-0">
              <div className="font-medium">{log.exercise_name}</div>
              <div className="text-sm text-gray-600">
                {log.reps && <span>{log.reps} herhalingen • </span>}
                {log.weight_kg && <span>{log.weight_kg}kg • </span>}
                {(log.time_seconds || log.time_sec) && (
                  <span>{log.time_seconds || log.time_sec}s • </span>
                )}
                {log.notes && <span className="italic">"{log.notes}"</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigatie knoppen */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Terug naar Dashboard
        </button>
        
        <button
          onClick={() => navigate(`/workout/${workout.id}`)}
          className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Workout herhalen
        </button>
      </div>
    </div>
  );
}
