// src/routes/workouts/[id].tsx
import { Navigate, useParams } from "react-router-dom";

export default function LegacyWorkoutDetailRedirect() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/modules/workouts" replace />;
  return <Navigate to={`/modules/programs/${encodeURIComponent(id)}`} replace />;
}
