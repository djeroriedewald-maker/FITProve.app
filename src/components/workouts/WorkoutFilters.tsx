import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Props = {
  value: {
    q?: string;
    goal?: string;
    level?: string;
    location?: string;
    equipment?: 'with'|'without'|'any';
    duration?: '15'|'30'|'45'|'60'|'90'|'any';
  };
  onChange: (v: Props['value']) => void;
};

const goals = [
  { v:'strength', l:'Kracht' }, { v:'hypertrophy', l:'Spieropbouw' }, { v:'fat_loss', l:'Vetverlies' },
  { v:'conditioning', l:'Conditioning' }, { v:'mobility', l:'Mobiliteit' }, { v:'endurance', l:'Uithouding' }, { v:'event', l:'Event' }
];

const levels = [
  { v:'beginner', l:'Beginner' }, { v:'intermediate', l:'Gevorderd' }, { v:'advanced', l:'Advanced' }
];

const locations = [
  { v:'gym', l:'Gym' }, { v:'outdoor', l:'Buiten' }, { v:'home', l:'Thuis' }
];

const durations = ['15','30','45','60','90'];

export default function WorkoutFilters({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const state = useMemo(() => ({ ...value }), [value]);

  useEffect(() => {
    // close on escape
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const set = (patch: Partial<Props['value']>) => onChange({ ...state, ...patch });

  return (
    <div className="w-full sticky top-0 z-20 backdrop-blur bg-background/60 border-b">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
        <input
          className="flex-1 rounded-xl px-3 py-2 bg-muted outline-none"
          placeholder="Zoek workout…"
          value={state.q ?? ''}
          onChange={(e)=>set({ q: e.target.value })}
        />
        <button className="rounded-xl px-3 py-2 bg-muted flex items-center gap-1" onClick={()=>setOpen(!open)}>
          Filters <ChevronDown className={`h-4 w-4 transition ${open?'rotate-180':''}`} />
        </button>
      </div>
      {open && (
        <div className="max-w-3xl mx-auto px-4 pb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <select className="rounded-xl px-3 py-2 bg-muted" value={state.goal ?? ''} onChange={e=>set({goal: e.target.value || undefined})}>
            <option value="">Doel</option>
            {goals.map(g => <option key={g.v} value={g.v}>{g.l}</option>)}
          </select>

          <select className="rounded-xl px-3 py-2 bg-muted" value={state.level ?? ''} onChange={e=>set({level: e.target.value || undefined})}>
            <option value="">Niveau</option>
            {levels.map(l => <option key={l.v} value={l.v}>{l.l}</option>)}
          </select>

          <select className="rounded-xl px-3 py-2 bg-muted" value={state.location ?? ''} onChange={e=>set({location: e.target.value || undefined})}>
            <option value="">Locatie</option>
            {locations.map(l => <option key={l.v} value={l.v}>{l.l}</option>)}
          </select>

          <select className="rounded-xl px-3 py-2 bg-muted" value={state.equipment ?? 'any'} onChange={e=>set({equipment: (e.target.value as any)})}>
            <option value="any">Materiaal (alles)</option>
            <option value="with">Met materiaal</option>
            <option value="without">Zonder materiaal</option>
          </select>

          <select className="rounded-xl px-3 py-2 bg-muted" value={state.duration ?? 'any'} onChange={e=>set({duration: (e.target.value as any)})}>
            <option value="any">Duur (alle)</option>
            {durations.map(d => <option key={d} value={d}>{d} min</option>)}
          </select>

          <button className="rounded-xl px-3 py-2 bg-muted" onClick={()=>onChange({})}>Reset</button>
        </div>
      )}
    </div>
  );
}
