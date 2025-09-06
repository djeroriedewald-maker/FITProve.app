// src/routes/workouts/index.tsx
import { Navigate } from "react-router-dom";

export default function LegacyWorkoutsIndex() {
  return <Navigate to="/modules/workouts" replace />;
}
