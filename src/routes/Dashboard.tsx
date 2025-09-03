import React from 'react';
import { useAuth } from '@/context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 text-white">
      <h1 className="text-2xl font-bold">Welkom terug{user?.email ? `, ${user.email}` : ''} 👋</h1>
      <p className="text-white/70 mt-2">
        Dit is je nieuwe FITProve dashboard. Coach Tai houdt je voortgang in de gaten.
      </p>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h2 className="font-semibold mb-1">KPI’s</h2>
          <p className="text-white/70 text-sm">Hier komen je persoonlijke stats en KPI-cards.</p>
        </div>
        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h2 className="font-semibold mb-1">Acties</h2>
          <p className="text-white/70 text-sm">Volgende training, badges en notificaties.</p>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
