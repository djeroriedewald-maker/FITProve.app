export default function Stats() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">Calories · 450</div>
        <div className="p-4 border rounded">Workout time · 45 min</div>
        <div className="p-4 border rounded">Heart rate · 145 bpm</div>
        <div className="p-4 border rounded">Strength · 5x5</div>
      </div>
    </div>
  );
}
