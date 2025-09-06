// src/routes/modules/workouts/index.tsx
import { useEffect, useMemo, useState } from "react";
import WorkoutCard from "@/components/workouts/WorkoutCard";
import { listWorkouts } from "@/lib/workouts-client";
import type { Workout as WorkoutT } from "@/types/workouts";
import { supabase } from "@/lib/supabaseClient";

/** === Types voor Exercise Library (losse oefeningen) === */
type Media = { images?: string[]; gifs?: string[]; videos?: string[]; thumbnail?: string };
type Exercise = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  instructions?: string[];
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment: string[];
  category?: string;
  media: Media;
  language: "en";
};
type Manifest = { version: string; total: number; chunks: number; chunkSize: number; basePath: string };

const BASE = (import.meta as any).env?.VITE_WORKOUTS_BASE as string | undefined;
const HERO_URL = "https://fitprove.app/images/modules/workout.webp";

/** Helpers (Exercise Library) */
async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
  return (await res.json()) as T;
}
type Regio = "all" | "onderlichaam" | "romp" | "armen" | "rug" | "benen";
const REGIO_LABEL: Record<Regio, string> = {
  all: "Alle regio’s",
  onderlichaam: "Onderlichaam",
  romp: "Romp",
  armen: "Armen",
  rug: "Rug",
  benen: "Benen",
};
const REGIO_MAP: Record<Exclude<Regio, "all">, Set<string>> = {
  onderlichaam: new Set([
    "glutes", "gluteus", "hips", "hip flexors", "adductors", "abductors",
    "quadriceps", "quads", "hamstrings", "calves", "soleus", "tibialis",
  ]),
  romp: new Set(["abdominals", "abs", "core", "obliques", "transverse abdominis", "pelvic floor", "serratus"]),
  armen: new Set(["biceps", "triceps", "forearms"]),
  rug: new Set(["back", "upper back", "lats", "latissimus dorsi", "traps", "trapezius", "rhomboids", "erector spinae", "lower back"]),
  benen: new Set(["quadriceps", "quads", "hamstrings", "calves", "soleus", "tibialis"]),
};
function exerciseMatchesRegio(x: Exercise, regio: Regio): boolean {
  if (regio === "all") return true;
  const muscles = [...(x.primaryMuscles ?? []), ...(x.secondaryMuscles ?? [])].map((m) => m.toLowerCase());
  const targets = REGIO_MAP[regio];
  return muscles.some((m) => targets.has(m));
}
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function WorkoutsIndex() {
  /** === Tabs: je komt hier via /modules → Workouts (home). Pas daarna kies je ‘Workout Library’. === */
  type Tab = "home" | "exercise-library" | "workout-library" | "my" | "badges" | "help";
  const [tab, setTab] = useState<Tab>("home");

  // =========================
  // Exercise Library (losse oefeningen) — nodig voor KPI "Oefeningen"
  // =========================
  const [items, setItems] = useState<Exercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!BASE) throw new Error("VITE_WORKOUTS_BASE ontbreekt in .env");
        const manifest = await getJSON<Manifest>(`${BASE}/manifest.json`);
        const urls = Array.from({ length: manifest.chunks }, (_, i) => `${BASE}/chunk-${String(i).padStart(3, "0")}.json`);
        const parts = await Promise.all(urls.map((u) => getJSON<Exercise[]>(u)));
        const all = parts.flat();
        if (mounted) setItems(all);
      } catch (e: any) {
        console.error(e);
        if (mounted) {
          setError(e?.message ?? "Kon de exercise library niet laden.");
          setItems([]);
        }
      }
    }
    // Laden voor stats + exercise-library
    load();
    return () => { mounted = false; };
  }, []);

  /** ===== KPI's voor Home ===== */
  const [kpi, setKpi] = useState({
    exercisesInLibrary: 0,
    workoutsInLibrary: 0,
    workoutsDone: 0,
    badgesEarned: 0,
    loading: true,
  });

  useEffect(() => {
    setKpi((s) => ({ ...s, exercisesInLibrary: (items ?? []).length }));
  }, [items]);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        await supabase.auth.getUser();

        // Workouts in library
        let workoutsInLibrary = 0;
        try {
          const { count: wCount } = await supabase
            .from("workouts")
            .select("id", { count: "exact", head: true });
          workoutsInLibrary = wCount ?? 0;
        } catch {
          const list = await listWorkouts({});
          workoutsInLibrary = (list ?? []).length;
        }

        // Workouts gedaan
        let workoutsDone = 0;
        try {
          const { count } = await supabase
            .from("workout_sessions")
            .select("id", { count: "exact" })
            .eq("status", "completed");
          workoutsDone = count ?? 0;
        } catch {}

        // Badges verdiend
        let badgesEarned = 0;
        try {
          const { count } = await supabase
            .from("user_badges")
            .select("id", { count: "exact" });
          badgesEarned = count ?? 0;
        } catch {}

        if (!on) return;
        setKpi((s) => ({ ...s, workoutsInLibrary, workoutsDone, badgesEarned, loading: false }));
      } catch {
        if (!on) return;
        setKpi((s) => ({ ...s, loading: false }));
      }
    })();
    return () => { on = false; };
  }, []);

  /** Afgeleide stats + filters voor Exercise Library */
  const statsExtra = useMemo(() => {
    const list = items ?? [];
    const withVideo = list.filter((x) => (x.media?.videos?.length ?? 0) > 0).length;
    const equipSet = new Set<string>();
    list.forEach((x) => x.equipment?.forEach((e) => equipSet.add(e)));
    const musclesSet = new Set<string>();
    list.forEach((x) => [...(x.primaryMuscles ?? []), ...(x.secondaryMuscles ?? [])].forEach((m) => musclesSet.add(m)));
    return { withVideo, equipments: equipSet.size, muscles: musclesSet.size };
  }, [items]);

  const [q, setQ] = useState("");
  const [level, setLevel] = useState<string>("all");
  const [equipment, setEquipment] = useState<string>("all");
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  const [regio, setRegio] = useState<Regio>("all");

  const equipmentOptions = useMemo(() => {
    const set = new Set<string>();
    (items ?? []).forEach((x) => x.equipment?.forEach((e) => set.add(e)));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  type CardItem = { id: string; title: string; duration?: number; level?: string; tags?: string[]; thumbnail?: string };
  const exerciseCards: CardItem[] = useMemo(() => {
    const qnorm = q.trim().toLowerCase();
    return (items ?? [])
      .filter((x) => {
        const okQ =
          !qnorm ||
          x.name.toLowerCase().includes(qnorm) ||
          (x.category ?? "").toLowerCase().includes(qnorm) ||
          x.primaryMuscles.some((m) => m.toLowerCase().includes(qnorm)) ||
          (x.secondaryMuscles ?? []).some((m) => m.toLowerCase().includes(qnorm));
        const okEquip = equipment === "all" ? true : x.equipment.includes(equipment);
        const okLevel = level === "all" ? true : true;
        const okVideo = !hasVideo || ((x.media?.videos?.length ?? 0) > 0);
        const okRegio = exerciseMatchesRegio(x, regio);
        return okQ && okEquip && okLevel && okVideo && okRegio;
      })
      .slice(0, 100)
      .map((x) => {
        const tagSet = new Set<string>([
          ...(x.equipment ?? []),
          ...(x.primaryMuscles ?? []).slice(0, 2),
        ]);
        if ((x.media?.videos?.length ?? 0) > 0) tagSet.add("video");
        return {
          id: x.id,
          title: x.name,
          duration: undefined,
          level: undefined,
          tags: Array.from(tagSet),
          thumbnail: x.media?.thumbnail,
        };
      });
  }, [items, q, level, equipment, hasVideo, regio]);

  // =========================
  // Workout Library (volledige workouts via Supabase)
  // =========================
  type WF = {
    q?: string;
    goal?: string;
    level?: string;
    location?: string;
    equipment?: "with" | "without" | "any";
    duration?: "15" | "30" | "45" | "60" | "90" | "any";
  };
  const [wf, setWf] = useState<WF>({ equipment: "any", duration: "any" });
  const [workouts, setWorkouts] = useState<WorkoutT[]>([]);
  const [woLoading, setWoLoading] = useState<boolean>(false);
  const [woErr, setWoErr] = useState<string | undefined>();

  useEffect(() => {
    if (tab !== "workout-library") return;
    let on = true;
    setWoLoading(true);
    setWoErr(undefined);

    listWorkouts({
      q: wf.q,
      goal: wf.goal || undefined,
      level: wf.level || undefined,
      location: wf.location || undefined,
      equipment: wf.equipment && wf.equipment !== "any" ? wf.equipment : undefined,
      duration: wf.duration && wf.duration !== "any" ? (wf.duration as any) : undefined,
    })
      .then((data) => on && setWorkouts(data || []))
      .catch((e) => on && setWoErr(e.message))
      .finally(() => on && setWoLoading(false));

    return () => { on = false; };
  }, [tab, wf]);

  /** My Workouts (compacte geschiedenis) */
  type Session = { id: string; workout_id: string; workout_title?: string | null; status: string; started_at: string; completed_at?: string | null };
  const [recent, setRecent] = useState<Session[] | null>(null);
  useEffect(() => {
    if (tab !== "my") return;
    let on = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("workout_sessions")
          .select("id, workout_id, workout_title, status, started_at, completed_at")
          .order("started_at", { ascending: false })
          .limit(5);
        if (error) throw error;
        if (on) setRecent(data as Session[]);
      } catch {
        if (on) setRecent([]);
      }
    })();
    return () => { on = false; };
  }, [tab]);

  /** Shared UI styles */
  const baseField =
    "h-10 text-sm rounded-lg border px-3 outline-none transition " +
    "bg-white text-zinc-900 border-zinc-300 " +
    "dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 " +
    "placeholder:text-zinc-500 dark:placeholder:text-zinc-400 " +
    "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";
  const selectField = baseField + " pr-8";
  const chipBtn = (active: boolean) =>
    cx(
      "px-3 py-2 rounded-xl border text-sm transition",
      active
        ? "border-orange-600 bg-orange-600/10 text-orange-600"
        : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300 bg-transparent"
    );
  const activeHighlight = "border-orange-500 bg-orange-500/10";

  const heading =
    tab === "home" ? "Workouts"
    : tab === "exercise-library" ? "Oefeningen"
    : tab === "workout-library" ? "Workout Library"
    : tab === "my" ? "My Workouts"
    : "Workouts";

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      {/* Hero alleen op Home */}
      {tab === "home" && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <img src={HERO_URL} alt="Workout" className="w-full h-40 sm:h-56 object-cover" loading="lazy" />
        </div>
      )}

      <h1 className="text-2xl font-bold mb-3">{heading}</h1>

      {/* Tabs (geen router redirect) */}
      <div className="mb-3 flex gap-2 flex-wrap">
        {(["home", "exercise-library", "workout-library", "my", "badges", "help"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={chipBtn(tab === t)}>
            {t === "home"
              ? "Home"
              : t === "exercise-library"
              ? "Exercise Library"
              : t === "workout-library"
              ? "Workout Library"
              : t === "my"
              ? "My Workouts"
              : t === "badges"
              ? "Badges"
              : "Help"}
          </button>
        ))}
      </div>

      {/* ===== HOME (Landing) ===== */}
      {tab === "home" && (
        <section className="space-y-6">
          {/* KPI's */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Kpi title="Oefeningen" value={kpi.exercisesInLibrary} hint="in library" loading={kpi.loading && (items === null)} />
            <Kpi title="Workouts" value={kpi.workoutsInLibrary} hint="in library" loading={kpi.loading} />
            <Kpi title="Gedaan" value={kpi.workoutsDone} hint="workouts" loading={kpi.loading} />
            <Kpi title="Badges" value={kpi.badgesEarned} hint="verdiend" loading={kpi.loading} />
          </div>

          {/* Extra mini-statistieken */}
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Met video" value={statsExtra.withVideo} />
            <MiniStat label="Materiaaltypes" value={statsExtra.equipments} />
            <MiniStat label="Spiergroepen" value={statsExtra.muscles} />
          </div>

          {/* CTA's */}
          <div className="grid gap-3">
            <GuideCard
              title="Exercise Library"
              text="Zoek losse oefeningen op naam, spiergroep, materiaal of alleen met video."
              onClick={() => setTab("exercise-library")}
            />
            <GuideCard
              title="Workout Library"
              text="Complete workouts met filters op doel, niveau, materiaal en duur."
              onClick={() => setTab("workout-library")}
            />
            <GuideCard
              title="My Workouts"
              text="Bekijk je sessie-historie en voortgang."
              onClick={() => setTab("my")}
            />
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
            Dataset geladen vanaf <code>VITE_WORKOUTS_BASE</code> ({BASE ?? "niet ingesteld"}).
          </p>
        </section>
      )}

      {/* ===== Exercise Library (losse oefeningen) ===== */}
      {tab === "exercise-library" && (
        <>
          <div className="flex gap-2 w-full flex-wrap">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Zoek exercise..."
              className={cx(baseField, q && activeHighlight, "flex-1 sm:w-64")}
              aria-label="Zoek"
            />
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={cx(selectField, level !== "all" && activeHighlight)}
              aria-label="Filter op niveau"
            >
              <option value="all">Alle niveaus</option>
            </select>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className={cx(selectField, equipment !== "all" && activeHighlight)}
              aria-label="Filter op materiaal"
            >
              {equipmentOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "all" ? "Alle equipment" : opt}
                </option>
              ))}
            </select>
            <select
              value={regio}
              onChange={(e) => setRegio(e.target.value as Regio)}
              className={cx(selectField, regio !== "all" && activeHighlight)}
              aria-label="Filter op regio"
            >
              {(Object.keys(REGIO_LABEL) as Regio[]).map((key) => (
                <option key={key} value={key}>
                  {REGIO_LABEL[key]}
                </option>
              ))}
            </select>
            <label
              className={cx(
                baseField,
                "flex items-center gap-2 cursor-pointer select-none w-auto px-3",
                hasVideo && activeHighlight
              )}
              title="Toon alleen oefeningen met video"
            >
              <input
                type="checkbox"
                className="accent-orange-500 h-4 w-4"
                checked={hasVideo}
                onChange={(e) => setHasVideo(e.target.checked)}
                aria-label="Alleen met video"
              />
              <span>Alleen met video</span>
            </label>
          </div>

          {/* Loading */}
          {items === null && (
            <div className="mt-4 grid gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                  <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-3 w-1/4 bg-zinc-200 dark:bg-zinc-800 mt-2 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {items !== null && error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">Fout bij laden: {error}</p>}

          {/* Results */}
          {items !== null && !error && (
            <div className="mt-4 grid gap-3">
              {exerciseCards.map((w) => (
                <WorkoutCard
                  key={w.id}
                  id={w.id}
                  title={w.title}
                  duration={w.duration}
                  level={w.level}
                  tags={w.tags}
                  thumbnail={w.thumbnail}
                />
              ))}
              {exerciseCards.length === 0 && <p className="opacity-70">Geen resultaten. Pas je filters aan.</p>}
            </div>
          )}
        </>
      )}

      {/* ===== Workout Library (volledige programma’s uit Supabase) ===== */}
      {tab === "workout-library" && (
        <section className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <input
              value={wf.q ?? ""}
              onChange={(e) => setWf((f) => ({ ...f, q: e.target.value }))}
              placeholder="Zoek workout..."
              className={cx(baseField, (wf.q ?? "") !== "" && activeHighlight, "flex-1 sm:w-64")}
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
            <button
              className={cx(baseField, "px-3 h-10")}
              onClick={() => setWf({ equipment: "any", duration: "any" })}
            >
              Reset
            </button>
          </div>

          {/* Data */}
          {woErr && <div className="text-sm text-red-600 dark:text-red-400">Error: {woErr}</div>}
          {woLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : workouts.length ? (
            <div className="grid gap-3">
              {workouts.map((w) => (
                <WorkoutCard
                  key={w.id}
                  id={w.id}
                  title={w.title}
                  duration={w.duration_minutes ?? undefined}  // ✅ null-safe
                  level={w.level ?? undefined}                 // ✅ null-safe
                  tags={[]}
                  thumbnail={undefined}
                  /** 🔑 BELANGRIJK: ga naar Program-detail i.p.v. Exercise-detail */
                  to={`/modules/programs/${w.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Geen workouts gevonden. Pas je filters aan of voeg workouts toe in Supabase (Table Editor → <code>workouts</code>).
            </div>
          )}
        </section>
      )}

      {/* ===== My Workouts (compacte geschiedenis) ===== */}
      {tab === "my" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Laatste sessies</h2>
            <a
              href="/modules/workouts/logs"
              className="text-sm underline decoration-orange-500 decoration-2 underline-offset-2 hover:opacity-80"
            >
              Volledige geschiedenis
            </a>
          </div>

          {recent === null ? (
            <div className="space-y-2">
              <div className="h-16 animate-pulse rounded-2xl bg-muted/40" />
              <div className="h-16 animate-pulse rounded-2xl bg-muted/40" />
            </div>
          ) : recent.length === 0 ? (
            <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
              Nog geen sessies opgeslagen. Start een workout via de library.
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((s) => (
                <a
                  key={s.id}
                  href={`/modules/programs/${encodeURIComponent(s.workout_id)}?sid=${s.id}`}
                  className="block rounded-2xl border bg-card p-4 shadow-sm hover:bg-accent"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-semibold">{s.workout_title ?? "Workout"}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(s.started_at).toLocaleString()}
                        {s.completed_at ? ` • voltooid` : ` • actief`}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        s.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "badges" && (
        <div className="mt-6 opacity-80">
          <p>Badges-overzicht komt hier. (Volgende PR: badge engine + grid.)</p>
        </div>
      )}

      {tab === "help" && (
        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">Help</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><b>Exercise Library</b>: losse oefeningen vinden (spier, materiaal, video).</li>
            <li><b>Workout Library</b>: complete workouts met doel/niveau/locatie/materiaal/duur.</li>
            <li><b>My Workouts</b>: jouw sessie-historie (na voltooien).</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/** Kleine UI helpers */
function Kpi({ title, value, hint, loading }: { title: string; value: number | string; hint?: string; loading?: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/70 dark:bg-zinc-900/60">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{title}</div>
      {loading ? (
        <div className="mt-1 h-7 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      ) : (
        <div className="text-2xl font-semibold mt-1">{value}</div>
      )}
      {hint && <div className="text-[11px] text-zinc-500 mt-1">{hint}</div>}
    </div>
  );
}
function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-white/60 dark:bg-zinc-900/50">
      <div className="text-[11px] text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
function GuideCard({ title, text, onClick }: { title: string; text: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 transition
                 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 focus:outline-none
                 focus:ring-2 focus:ring-orange-500/30"
    >
      <div className="font-semibold">{title}</div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{text}</p>
    </button>
  );
}
