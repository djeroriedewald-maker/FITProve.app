const validateUUID = (id: string): boolean => {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidRegex.test(id);
};

export async function getWorkoutFull(id: string): Promise<{
	workout: Workout;
	blocks: WorkoutBlock[];
	exercises: WorkoutExercise[];
}> {
	console.log('[getWorkoutFull] Fetching workout with id:', id);
	
	if (!validateUUID(id)) {
		throw new Error("Invalid UUID format");
	}

	// Get workout details
	const { data: workout, error: we } = await supabase
		.from("workouts")
		.select("*")
		.eq("id", id)
		.maybeSingle();
	console.log('[getWorkoutFull] Workout data:', workout);
	if (we) {
		console.error('[getWorkoutFull] Workout error:', we);
		throw we;
	}
	if (!workout) throw new Error("Workout niet gevonden");
	// Get workout blocks in proper sequence
	const { data: blocks, error: be } = await supabase
		.from("workout_blocks")
		.select("*")
		.eq("workout_id", id)
		.order("sequence", { ascending: true });
	console.log('[getWorkoutFull] Blocks data:', blocks);
	if (be) {
		console.error('[getWorkoutFull] Blocks error:', be);
		throw be;
	}
	// Get all exercises for these blocks
	const blockIds = (blocks ?? []).map((x) => x.id);
	console.log('[getWorkoutFull] Block IDs:', blockIds);
	let exercises: WorkoutExercise[] = [];
	if (blockIds.length) {
		try {
			console.log('[getWorkoutFull] Fetching exercises for blocks:', blockIds);
			const { data: exData, error: ee } = await supabase
				.from("workout_exercises")
				.select(`
					id,
					block_id,
					exercise_ref,
					sequence,
					display_name,
					target_reps,
					target_sets,
					rest_seconds,
					tempo,
					video_url,
					image_url,
					target_time_seconds,
					exercise:exercise_refs (
						id,
						name,
						description,
						equipment,
						pattern,
						level
					)
				`)
				.in("block_id", blockIds)
				.order("sequence", { ascending: true });
			if (ee) {
				console.error('[getWorkoutFull] Exercise fetch error:', ee);
				throw ee;
			}
			if (!exData || !Array.isArray(exData)) {
				console.error('[getWorkoutFull] Unexpected exercise data format:', exData);
				throw new Error('Invalid exercise data format');
			}
			exercises = exData.map(ex => {
				const exerciseData = ex as any;
				return {
					id: exerciseData.id,
					block_id: exerciseData.block_id,
					exercise_ref: exerciseData.exercise_ref || exerciseData.exerciseId,
					sequence: exerciseData.sequence || 0,
					display_name: exerciseData.display_name || exerciseData.exercise?.name || 'Unnamed Exercise',
					target_reps: exerciseData.target_reps || null,
					target_sets: exerciseData.target_sets || null,
					target_time_seconds: exerciseData.target_time_seconds || null,
					rest_seconds: exerciseData.rest_seconds || null,
					tempo: exerciseData.tempo || null,
					video_url: exerciseData.video_url || null,
					image_url: exerciseData.image_url || null,
					// Include exercise reference data if available
					exercise: exerciseData.exercise ? {
						id: exerciseData.exercise.id,
						name: exerciseData.exercise.name,
						description: exerciseData.exercise.description,
						equipment: exerciseData.exercise.equipment,
						pattern: exerciseData.exercise.pattern,
						level: exerciseData.exercise.level
					} : undefined
				} as WorkoutExercise;
			});
			console.log('[getWorkoutFull] Processed exercises:', exercises);
		} catch (err) {
			console.error("[getWorkoutFull] Failed to fetch exercises:", err);
			exercises = [];
		}
	}
	const result = {
		workout: workout as Workout,
		blocks: (blocks ?? []) as WorkoutBlock[],
		exercises
	};
	console.log('[getWorkoutFull] Final result:', result);
	// Validate the data
	if (!exercises.length) {
		console.warn('[getWorkoutFull] No exercises found for workout');
	}
	if (!blocks.length) {
		console.warn('[getWorkoutFull] No blocks found for workout');
	}
	return result;
}
import { supabase } from "./supabaseClient";
import type {
	Workout,
	WorkoutBlock,
	WorkoutExercise,
	UserWorkoutSession,
	SetLog,
	SetLogUpsert
} from "@/types/workout";

/** Basis workout functies */
export async function listWorkouts(params: {
	q?: string;
	goal?: string;
	level?: string;
	location?: string;
	equipment?: "with" | "without" | "any";
	duration?: "15" | "30" | "45" | "60" | "90" | "any";
	style?: string | "any";
} = {}): Promise<Workout[]> {
	try {
		console.log('[listWorkouts] Starting query with params:', params);

		let query = supabase.from("workouts").select("*");
    
		if (params.q?.trim()) {
			const s = `%${params.q.trim()}%`;
			query = query.or(`title.ilike.${s},description.ilike.${s}`);
		}
		if (params.goal) query = query.eq("goal", params.goal);
		if (params.level) query = query.eq("level", params.level);
		if (params.location) query = query.eq("location", params.location);
		if (params.equipment === "with") query = query.eq("equipment_required", true);
		if (params.equipment === "without") query = query.eq("equipment_required", false);
		if (params.duration && params.duration !== "any") query = query.eq("duration_minutes", Number(params.duration));
    
		const { data, error } = await query.order("title", { ascending: true });
    
		if (error) {
			console.error('[listWorkouts] Supabase error:', error);
			throw new Error(`Fout bij het ophalen van workouts: ${error.message}`);
		}
    
		if (!data) {
			console.warn('[listWorkouts] No data returned from query');
			return [];
		}

		console.log('[listWorkouts] Successfully fetched', data.length, 'workouts');
		return data as Workout[];
	} catch (err: any) {
		console.error('[listWorkouts] Unexpected error:', err);
		throw new Error(`Fout bij het ophalen van workouts: ${err.message}`);
	}
}
