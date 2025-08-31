import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import TopNav from './components/TopNav';
import TabBar from './components/TabBar';
import FloatingCoach from './components/common/FloatingCoach';

import Home from './pages/Home';
import Profile from './pages/Profile';
import Coach from './pages/Coach';

// Lightweight placeholders so routes never crash if a page is missing yet
function Challenges() {
  return (
    <div className="container mx-auto px-4 py-6">
      <section className="card card-pad">
        <h1 className="text-xl font-extrabold">Uitdagingen</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Placeholder voor Challenges. (Route /challenges)
        </p>
      </section>
    </div>
  );
}
function Badges() {
  return (
    <div className="container mx-auto px-4 py-6">
      <section className="card card-pad">
        <h1 className="text-xl font-extrabold">Badges</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Placeholder voor Badges. (Route /badges)
        </p>
      </section>
    </div>
  );
}
function Agenda() {
  return (
    <div className="container mx-auto px-4 py-6">
      <section className="card card-pad">
        <h1 className="text-xl font-extrabold">Agenda</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Placeholder voor Agenda. (Route /agenda)
        </p>
      </section>
    </div>
  );
}
function Feed() {
  return (
    <div className="container mx-auto px-4 py-6">
      <section className="card card-pad">
        <h1 className="text-xl font-extrabold">Nieuwsfeed</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Placeholder voor Nieuwsfeed. (Route /feed)
        </p>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <>
      {/* Always-on top navigation */}
      <TopNav />

      {/* Page content; leave bottom padding for the TabBar */}
      <main className="pb-20">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Bottom nav targets */}
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/feed" element={<Feed />} />

          {/* Other pages */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/coach" element={<Coach />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Persistent bottom nav + floating coach */}
      <TabBar />
      <FloatingCoach />
    </>
  );
}
