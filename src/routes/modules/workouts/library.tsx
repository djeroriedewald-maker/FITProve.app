// src/routes/modules/workouts/library.tsx
import { useEffect, useMemo, useState } from "react";
import WorkoutCard from "@/components/workouts/WorkoutCard";
import { listWorkouts } from "@/lib/workouts-client";
import type { Workout as WorkoutT } from "@/types/workout";\nimport { loadExerciseThumbnails, pickThumbFor } from "@/lib/exercise-thumbs";\nimport { supabase } from "@/lib/supabaseClient";

type WF = {
  q?: string;
  goal?: string;
  level?: string;
  location?: string;
  equipment?: "with" | "without" | "any";
  duration?: "15" | "30" | "45" | "60" | "90" | "any";
};

export default function WorkoutLibraryPage() {
  const [wf, setWf] = useState<WF>({ equipment: "any", duration: "any" });
  const [workouts, setWorkouts] = useState<WorkoutT[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);\n  const [thumbs, setThumbs] = useState<string[]>([]);\n  const [styleMap, setStyleMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    let on = true;
    setLoading(true);
    setErr(null);
    listWorkouts({
      q: wf.q,
      goal: wf.goal || undefined,
      level: wf.level || undefined,
      location: wf.location || undefined,
      equipment: wf.equipment && wf.equipment !== "any" ? wf.equipment : undefined,
      duration: wf.duration && wf.duration !== "any" ? (wf.duration as any) : undefined,
    })
      .then((data) => {
        if (!on) return;
        setWorkouts(data || []);\n        (async () => {\n          try {\n            const ids = (data || []).map((w: any) => w.id);\n            if (!ids.length) { setStyleMap(new Map()); return; }\n            const { data: blocks } = await supabase.from("workout_blocks").select("workout_id, style, sequence").in("workout_id", ids);\n            const map = new Map<string, string>();\n            const prefer = (s?: string | null) => { if (!s) return '; const t = String(s); if (/warm/i.test(t) || /cool/i.test(t)) return '; return t; };\n            (blocks || []).forEach((b: any) => { const cur = map.get(b.workout_id); const pick = prefer(b.style) || cur || '; if (!cur && pick) map.set(b.workout_id, pick); });\n            setStyleMap(map);\n          } catch {}\n        })();
      })
      .catch((e) => {
        if (!on) return;
        setErr(e?.message ?? "Kon workouts niet laden.");
      })
      .finally(() => on && setLoading(false));
    return () => {
      on = false;
    };
  }, [wf]);\n\n  // Load exercise thumbnails pool for fallback imagery\n  useEffect(() => {\n    let on = true;\n    (async () => {\n      const list = await loadExerciseThumbnails(200);\n      if (on) setThumbs(list);\n    })();\n    return () => { on = false; };\n  }, []);

  const baseField =
    "h-10 text-sm rounded-lg border px-3 outline-none transition " +
    "bg-white text-zinc-900 border-zinc-300 " +
    "dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 " +
    "placeholder:text-zinc-500 dark:placeholder:text-zinc-400 " +
    "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";
  const selectField = baseField + " pr-8";

  const hasFilters = useMemo(
    () =>
      Boolean(wf.q) ||
      Boolean(wf.goal) ||
      Boolean(wf.level) ||
      (wf.equipment && wf.equipment !== "any") ||
      (wf.duration && wf.duration !== "any"),
    [wf]
  );

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-3">Workout Library</h1>

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
        </select>\r\n        <select value={wf.style ?? "any"} onChange={(e) => setWf((f) => ({ ...f, style: (e.target.value || "any") as any }))} className={selectField} aria-label="Soort training">\r\n          <option value="any">Alle soorten</option>\r\n          <option value="Strength">Strength</option>\r\n          <option value="Hypertrophy">Hypertrophy</option>\r\n          <option value="AMRAP">AMRAP</option>\r\n          <option value="EMOM">EMOM</option>\r\n          <option value="Intervals">Intervals</option>\r\n          <option value="Circuit">Circuit</option>\r\n          <option value="Mobility">Mobility</option>\r\n          <option value="Cardio">Cardio</option>\r\n        </select>\r\n        <button
          className={baseField + " px-3 h-10"}
          onClick={() => setWf({ equipment: "any", duration: "any" })}
          disabled={!hasFilters}
          title="Reset filters"
        >
          Reset
        </button>
      </div>

      {/* Data */}
      {err && <div className="mt-3 text-sm text-red-600 dark:text-red-400">Error: {err}</div>}

      {loading ? (
        <div className="mt-4 grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
       ) : (workouts.length ? (\n        (() => { const list = (wf.style && wf.style !== "any") ? workouts.filter((w:any) => (styleMap.get(w.id) || "").toLowerCase() === wf.style!.toLowerCase()) : workouts; return (<div className="mt-4 grid gap-3">{list.map((w:any) => (\n            <WorkoutCard\n              key={w.id}\n              id={w.id}\n              title={w.title}\n              duration={w.duration_minutes ?? undefined}\n              level={w.level ?? undefined}\n              tags={[]}\n              thumbnail={pickThumbFor(w.id || w.title, thumbs)}\n              to={`/modules/programs/${w.id}`}\n            />\n          ))}</div>); })()\n      ) : (
        <div className="mt-4 grid gap-3">
          {workouts.map((w) => (
            <WorkoutCard
              key={w.id}
              id={w.id}
              title={w.title}
              duration={w.duration_minutes ?? undefined}  // null → undefined
              level={w.level ?? undefined}               // null → undefined
              tags={[]}
              thumbnail={pickThumbFor(w.id || w.title, thumbs)}
              to={`/modules/programs/${w.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Geen workouts gevonden. Pas je filters aan of voeg workouts toe in Supabase (Table Editor → <code>workouts</code>).
        </div>
      )}
    </div>
  );
}

