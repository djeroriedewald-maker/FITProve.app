// src/routes/modules/workouts/library.tsx
import { useEffect, useMemo, useState } from "react";
import WorkoutCard from "@/components/workouts/WorkoutCard";
import { listWorkouts } from "@/lib/workouts-client";
import type { Workout as WorkoutT } from "@/types/workout";
import { loadExerciseThumbnails, pickThumbFor } from "@/lib/exercise-thumbs";
import { supabase } from "@/lib/supabaseClient";

type WF = {
  q?: string;
  goal?: string;
  level?: string;
  location?: string;
  equipment?: "with" | "without" | "any";
  duration?: "15" | "30" | "45" | "60" | "90" | "any";
  style?: string | "any";
};

export default function WorkoutLibraryPage() {
  // State
  const [wf, setWf] = useState<WF>({ equipment: "any", duration: "any", style: "any" });
  const [workouts, setWorkouts] = useState<WorkoutT[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [styleMap, setStyleMap] = useState<Map<string, string>>(new Map());

  // Load workouts when filters change
  useEffect(() => {
    let mounted = true;

    const loadWorkouts = async () => {
      if (!mounted) return;
      
      setLoading(true);
      setErr(null);
      setWorkouts([]);
      setStyleMap(new Map());

      try {
        console.log('[WorkoutLibrary] Loading workouts with filters:', wf);
        
        const data = await listWorkouts({
          q: wf.q,
          goal: wf.goal || undefined,
          level: wf.level || undefined,
          location: wf.location || undefined,
          equipment: wf.equipment === 'any' ? undefined : wf.equipment,
          duration: wf.duration === 'any' ? undefined : wf.duration,
          style: wf.style === 'any' ? undefined : wf.style
        });

        if (!mounted) return;

        if (!Array.isArray(data)) {
          throw new Error('Unexpected response format from server');
        }

        // Store workouts
        setWorkouts(data);

        // If no workouts found, we're done
        if (data.length === 0) {
          return;
        }

        // Load blocks for style mapping
        const ids = data.map(w => w.id);
        const { data: blocks, error: blockError } = await supabase
          .from('workout_blocks')
          .select('workout_id, title')
          .in('workout_id', ids);

        if (blockError) {
          console.error('[WorkoutLibrary] Error loading blocks:', blockError);
          return;
        }

        if (!mounted) return;

        // Build style map from block titles
        const map = new Map<string, string>();
        
        const prefer = (title?: string | null): string => {
          if (!title) return '';
          const t = String(title).toLowerCase();
          if (t.includes('warm') || t.includes('cool')) return '';
          return t;
        };

        if (blocks) {
          blocks.forEach(b => {
            const style = prefer(b.title);
            if (style && !map.has(b.workout_id)) {
              map.set(b.workout_id, style);
            }
          });
        }

        if (mounted) {
          setStyleMap(map);
        }
      } catch (e: any) {
        console.error('[WorkoutLibrary] Error:', e);
        if (mounted) {
          setErr(e?.message || "Kon workouts niet laden");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadWorkouts();

    return () => {
      mounted = false;
    };
  }, [wf]);

  // Load thumbnails on mount
  useEffect(() => {
    let mounted = true;
    
    async function loadThumbs() {
      try {
        console.log('[WorkoutLibrary] Loading thumbnails...');
        const list = await loadExerciseThumbnails(200);
        
        if (!mounted) return;
        
        if (Array.isArray(list) && list.length > 0) {
          console.log('[WorkoutLibrary] Loaded', list.length, 'thumbnails');
          setThumbs(list);
        } else {
          console.warn('[WorkoutLibrary] No thumbnails loaded');
        }
      } catch (e) {
        console.error('[WorkoutLibrary] Failed to load thumbnails:', e);
        if (mounted) {
          setThumbs([]);
        }
      }
    }

    loadThumbs();
    
    return () => {
      mounted = false;
    };
  }, []);

  // CSS classes
  const baseField =
    "h-10 text-sm rounded-lg border px-3 outline-none transition " +
    "bg-white text-zinc-900 border-zinc-300 " +
    "dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 " +
    "placeholder:text-zinc-500 dark:placeholder:text-zinc-400 " +
    "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";
  const selectField = baseField + " pr-8";

  // Derived state
  const hasFilters = useMemo(
    () =>
      Boolean(wf.q) ||
      Boolean(wf.goal) ||
      Boolean(wf.level) ||
      Boolean(wf.location) ||
      (wf.equipment && wf.equipment !== "any") ||
      (wf.duration && wf.duration !== "any") ||
      (wf.style && wf.style !== "any"),
    [wf]
  );

  const listFiltered = useMemo(() => {
    if (!Array.isArray(workouts)) {
      console.warn('[WorkoutLibrary] workouts is not an array:', workouts);
      return [];
    }

    if (!workouts.length) {
      return [];
    }

    // Filter workouts based on style if needed
    if (wf.style && wf.style !== "any") {
      const want = wf.style.toLowerCase();
      return workouts.filter(w => {
        const style = styleMap.get(w.id)?.toLowerCase();
        return style && style.includes(want);
      });
    }

    return workouts;
  }, [workouts, wf.style, styleMap]);

  // Render
  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-3">Workout Library</h1>

      {err && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input
          value={wf.q ?? ""}
          onChange={(e) => setWf((f) => ({ ...f, q: e.target.value }))}
          placeholder="Zoek workout..."
          className={baseField + " flex-1 sm:w-64"}
          aria-label="Zoek workout"
        />
        <select 
          value={wf.goal ?? ""} 
          onChange={(e) => setWf((f) => ({ ...f, goal: e.target.value || undefined }))} 
          className={selectField} 
          aria-label="Filter op doel"
        >
          <option value="">Alle doelen</option>
          <option value="strength">Kracht</option>
          <option value="hypertrophy">Spieropbouw</option>
          <option value="fat_loss">Vetverlies</option>
          <option value="conditioning">Conditioning</option>
          <option value="mobility">Mobiliteit</option>
          <option value="endurance">Uithouding</option>
          <option value="event">Event</option>
        </select>
        <select 
          value={wf.level ?? ""} 
          onChange={(e) => setWf((f) => ({ ...f, level: e.target.value || undefined }))} 
          className={selectField} 
          aria-label="Filter op niveau"
        >
          <option value="">Alle niveaus</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Gevorderd</option>
          <option value="advanced">Advanced</option>
        </select>
        <select 
          value={wf.equipment ?? "any"} 
          onChange={(e) => setWf((f) => ({ ...f, equipment: e.target.value as WF["equipment"] }))} 
          className={selectField} 
          aria-label="Materiaal"
        >
          <option value="any">Alle materialen</option>
          <option value="with">Met materiaal</option>
          <option value="without">Zonder materiaal</option>
        </select>
        <select 
          value={wf.duration ?? "any"} 
          onChange={(e) => setWf((f) => ({ ...f, duration: e.target.value as WF["duration"] }))} 
          className={selectField} 
          aria-label="Duur"
        >
          <option value="any">Alle tijden</option>
          <option value="15">15 min</option>
          <option value="30">30 min</option>
          <option value="45">45 min</option>
          <option value="60">60 min</option>
          <option value="90">90 min</option>
        </select>
        <select 
          value={wf.style ?? "any"} 
          onChange={(e) => setWf((f) => ({ ...f, style: (e.target.value || 'any') as any }))} 
          className={selectField} 
          aria-label="Soort training"
        >
          <option value="any">Alle soorten</option>
          <option value="Strength">Strength</option>
          <option value="Hypertrophy">Hypertrophy</option>
          <option value="AMRAP">AMRAP</option>
          <option value="EMOM">EMOM</option>
          <option value="Intervals">Intervals</option>
          <option value="Circuit">Circuit</option>
          <option value="Mobility">Mobility</option>
          <option value="Cardio">Cardio</option>
        </select>
        <button 
          onClick={() => setWf({ equipment: "any", duration: "any", style: "any" })} 
          disabled={!hasFilters} 
          title="Reset filters"
          className={`${baseField} px-3 h-10 ${!hasFilters ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Reset
        </button>
      </div>

      {/* Data */}
      <div className="mt-4">
        {loading && (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && listFiltered.length === 0 && !err && (
          <div className="text-center py-8">
            <p className="text-zinc-600 dark:text-zinc-400">
              {workouts.length === 0 
                ? "Geen workouts gevonden."
                : "Geen workouts gevonden met deze filters."}
            </p>
            {hasFilters && (
              <button 
                onClick={() => setWf({ equipment: "any", duration: "any", style: "any" })}
                className="mt-2 text-sm text-orange-600 dark:text-orange-400 hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {!loading && listFiltered.length > 0 && (
          <div className="grid gap-3">
            {listFiltered.map((w) => (
              <WorkoutCard
                key={w.id}
                id={w.id}
                title={w.title}
                duration={w.duration_minutes ?? undefined}
                level={w.level ?? undefined}
                thumbnail={thumbs.length ? pickThumbFor(w.id, thumbs) : undefined}
                to={`/modules/programs/${w.id}`}
                tags={[]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
