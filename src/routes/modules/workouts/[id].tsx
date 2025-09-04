import ExerciseMedia from "@/components/workouts/ExerciseMedia";

export default function WorkoutDetail() {
  const workout = {
    id: "w1",
    title: "Full Body Beginner",
    duration_min: 30,
    level: "beginner",
    goal: "strength",
    blocks: [
      { title: "Circuit A", exercises: [{ name: "Bodyweight Squat" }, { name: "Push-up" }] }
    ]
  };

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">{workout.title}</h1>
      <p className="opacity-80">{workout.duration_min} min • {workout.level}</p>

      <div className="mt-4">
        <ExerciseMedia name="Bodyweight Squat" mp4Url={undefined} webmUrl={undefined} gifUrl={undefined} />
      </div>

      <button
        className="mt-4 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700"
        onClick={() => (window.location.href = "/modules/workouts/execute")}
      >
        Start workout
      </button>

      <div className="mt-6 space-y-3">
        {workout.blocks.map((b, i) => (
          <div key={i} className="rounded-2xl border border-neutral-800 p-4">
            <h3 className="font-semibold">{b.title}</h3>
            <ul className="mt-2 list-disc pl-5">
              {b.exercises.map((e, idx) => <li key={idx}>{e.name}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
