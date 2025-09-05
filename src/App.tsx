// src/App.tsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./layout/AppShell";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Bestaande routes (lazy)
const Home = lazy(() => import("./routes/Home"));
const Coach = lazy(() => import("./routes/Coach"));
const Stats = lazy(() => import("./routes/Stats"));
const News = lazy(() => import("./routes/News"));
const Profile = lazy(() => import("./routes/Profile"));

// Nieuwe routes
const LoginPage = lazy(() => import("./routes/LoginPage"));
const Dashboard = lazy(() => import("./routes/Dashboard"));

// Modules (lazy) – GENESTE ROUTES
const ModulesLayout = lazy(() => import("./routes/modules/ModulesLayout"));
// ✅ Belangrijk: de index hoort onder ./routes/modules/
const ModulesIndex = lazy(() => import("./routes/modules/ModulesIndex"));
const ModuleDetail = lazy(() => import("./routes/modules/ModuleDetail")); // dynamisch :slug

// ✅ Workouts module (lazy)
const WorkoutsIndex = lazy(() => import("./routes/modules/workouts/index"));
const WorkoutDetail = lazy(() => import("./routes/modules/workouts/[id]"));
// ✔ execute hoort bij een specifieke workout-id
const ExecuteWorkout = lazy(() => import("./routes/modules/workouts/execute"));
const BadgesPage = lazy(() => import("./routes/modules/workouts/badges"));
const WorkoutsHelp = lazy(() => import("./routes/modules/workouts/help"));
const WorkoutLogs = lazy(() => import("./routes/modules/workouts/logs"));

export default function App() {
  return (
    <AuthProvider>
      <AppShell>
        <Suspense fallback={<div className="px-4 py-6">Loading…</div>}>
          <Routes>
            {/* Publieke routes */}
            <Route path="/" element={<Home />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/news" element={<News />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Profiel (optioneel) protected */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Dashboard protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* ✅ MODULES: geneste routes met index + expliciete workouts + fallback :slug */}
            <Route
              path="/modules"
              element={
                <ProtectedRoute>
                  <ModulesLayout />
                </ProtectedRoute>
              }
            >
              {/* Overzicht met tegels – dit is wat /modules rendert */}
              <Route index element={<ModulesIndex />} />

              {/* Expliciete workouts-routes */}
              <Route path="workouts" element={<WorkoutsIndex />} />
              <Route path="workouts/:id" element={<WorkoutDetail />} />
              {/* execute hoort onder een :id; zo voorkom je losse /modules/workouts/execute */}
              <Route path="workouts/:id/execute" element={<ExecuteWorkout />} />
              <Route path="workouts/badges" element={<BadgesPage />} />
              <Route path="workouts/help" element={<WorkoutsHelp />} />
              <Route path="workouts/logs" element={<WorkoutLogs />} />

              {/* Fallback voor andere modules (detailpagina op :slug) */}
              <Route path=":slug" element={<ModuleDetail />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </AuthProvider>
  );
}
