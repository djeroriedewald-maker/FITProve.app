import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./layout/AppShell";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Bestaande routes
const Home = lazy(() => import("./routes/Home"));
const Coach = lazy(() => import("./routes/Coach"));
const Stats = lazy(() => import("./routes/Stats"));
const News = lazy(() => import("./routes/News"));
const Profile = lazy(() => import("./routes/Profile"));

// Nieuwe routes
const LoginPage = lazy(() => import("./routes/LoginPage"));
const Dashboard = lazy(() => import("./routes/Dashboard"));

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

            {/* (optioneel) Profiel kan blijven bestaan; maak ‘m protected als dit een user-page is */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Nieuwe protected dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </AuthProvider>
  );
}
