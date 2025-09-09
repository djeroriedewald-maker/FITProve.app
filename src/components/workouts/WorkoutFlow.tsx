import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Workout, WorkoutBlock, WorkoutExercise, SetLog } from '@/types/workout';
import { 
  initializeWorkoutState, 
  moveToNextExercise, 
  logExerciseSet,
  getLastWorkoutSession,
  getWorkoutSessionLogs,
  completeSession,
  type WorkoutState,
  type WorkoutProgress 
} from '@/lib/workouts-client';
import { CircleTimer } from './CircleTimer';
import SetLogger from './SetLogger';
import { WorkoutComplete } from './WorkoutComplete';

interface WorkoutFlowProps {
  workout: Workout;
  blocks: WorkoutBlock[];
  exercises: WorkoutExercise[];
}

export function WorkoutFlow({ workout, blocks, exercises }: WorkoutFlowProps) {
  // Validate required data
  if (!workout?.id) {
    console.error('[WorkoutFlow] Missing workout ID');
    return <div>Error: Ongeldige workout data</div>;
  }

  if (!blocks?.length) {
    console.error('[WorkoutFlow] No blocks available');
    return <div>Error: Geen workout blokken gevonden</div>;
  }

  if (!exercises?.length) {
    console.error('[WorkoutFlow] No exercises available');
    return <div>Error: Geen oefeningen gevonden</div>;
  }
  const navigate = useNavigate();
  const [workoutState, setWorkoutState] = useState<WorkoutState | null>(null);
  const [previousLogs, setPreviousLogs] = useState<SetLog[]>([]);

  // Timer state voor tijd-gebaseerde oefeningen
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // Afgeleide state
  const isStarted = Boolean(workoutState);
  const startTime = workoutState ? new Date(workoutState.session.started_at) : null;
  const currentExercise = workoutState?.currentExercise;
  const currentBlock = workoutState?.currentBlock;

  // Laad vorige workout logs
  useEffect(() => {
    async function loadPreviousSession() {
      try {
        const lastSession = await getLastWorkoutSession(workout.id);
        if (lastSession) {
          const logs = await getWorkoutSessionLogs(lastSession.id);
          setPreviousLogs(logs);
        }
      } catch (error) {
        console.error('Error loading previous session:', error);
      }
    }
    loadPreviousSession();
  }, [workout.id]);

  // Start de workout
  const handleStart = async () => {
    try {
      console.log('[WorkoutFlow] Starting workout with ID:', workout.id);
      const newState = await initializeWorkoutState(workout.id);
      console.log('[WorkoutFlow] Initialized workout state:', newState);
      
      if (!newState.currentBlock || !newState.currentExercise) {
        throw new Error('Workout data is onvolledig. Probeer het opnieuw.');
      }
      
      setWorkoutState(newState);
    } catch (error) {
      console.error('[WorkoutFlow] Error starting workout:', error);
      // TODO: Toon een foutmelding aan de gebruiker
    }
  };

  // Volgende oefening
  const handleNext = async () => {
    if (!workoutState) return;
    
    try {
      const newState = await moveToNextExercise(workoutState);
      setWorkoutState(newState);
      
      // Als de workout compleet is, redirect
      if (newState.progress.isCompleted) {
        navigate('/workout-complete');
      }
    } catch (error) {
      console.error('Error moving to next exercise:', error);
    }
  };

  // Rond de workout af
  const handleFinish = async () => {
    if (!workoutState || !startTime) return;
    
    try {
      const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
      await completeSession(workoutState.session.id, duration);
      
      // Redirect naar een success pagina of overzicht
      navigate('/workout-complete');
    } catch (error) {
      console.error('Error finishing workout:', error);
    }
  };

  // Log een set
  const handleLogSet = async (data: any) => {
    if (!workoutState || !currentExercise) return;
    
    try {
      const newState = await logExerciseSet(workoutState, {
        reps: data.reps,
        weight: data.weight,
        time: data.timeSeconds,
        notes: data.notes
      });
      setWorkoutState(newState);
    } catch (error) {
      console.error('Error logging set:', error);
    }
  };

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <img 
          src={exercises[0]?.image_url || '/images/workout.webp'} 
          alt={workout.title}
          className="w-full max-w-md rounded-lg shadow-lg"
        />
        
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{workout.title}</h1>
          <p className="text-gray-600 mb-4">{workout.description}</p>
          
          <div className="mb-4">
            <h2 className="font-semibold mb-2">Workout opbouw:</h2>
            <ul className="text-left">
              {blocks.map((block, i) => (
                <li key={block.id} className="mb-1">
                  {block.title} - {exercises.filter(e => e.block_id === block.id).length} oefeningen
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleStart}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Workout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {currentExercise && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">{currentExercise.display_name}</h2>
          
          {currentExercise.video_url ? (
            <video
              src={currentExercise.video_url}
              controls
              className="w-full max-w-md mx-auto rounded-lg"
            />
          ) : (
            <img
              src={currentExercise.image_url || '/images/workout.webp'}
              alt={currentExercise.display_name}
              className="w-full max-w-md mx-auto rounded-lg"
            />
          )}

          {/* Tijd-gebaseerde oefening */}
          {currentExercise.target_time_seconds && (
            <div className="flex flex-col items-center">
              <CircleTimer
                duration={currentExercise.target_time_seconds}
                onComplete={handleNext}
              />
            </div>
          )}

          {/* Repetitie-gebaseerde oefening */}
          {currentExercise.target_reps && (
            <SetLogger
              onAdd={handleLogSet}
            />
          )}

          {/* Vorige prestaties */}
          {previousLogs.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Vorige prestatie:</h3>
              {/* Toon relevante logs van de vorige sessie */}
            </div>
          )}

          <button
            onClick={handleNext}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {workoutState?.progress.currentBlockIndex === blocks.length - 1 && 
             currentExercise === exercises[exercises.length - 1]
              ? 'Workout afronden'
              : 'Volgende oefening'}
          </button>
        </div>
      )}
    </div>
  );
}
