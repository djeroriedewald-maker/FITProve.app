import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../lib/supabaseClient';

export default function Profile() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setUsername(profile?.username ?? '');
  }, [profile?.full_name, profile?.username]);

  if (!user) {
    return (
      <div className="p-4">
        <h1 className="mb-2 text-2xl font-semibold">Profile</h1>
        <p className="text-sm opacity-80">You need to be logged in to view your profile.</p>
      </div>
    );
  }

  const onSave = async () => {
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      username: username || null,
    });
    if (error) setMsg(error.message);
    else setMsg('Saved!');
    setSaving(false);
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-semibold">Your profile</h1>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm opacity-80">Full name</label>
          <input
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-white"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm opacity-80">Username</label>
          <input
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-white"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
            placeholder="jouwnaam"
          />
          <p className="mt-1 text-xs opacity-70">Moet uniek zijn.</p>
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>

        {msg && <p className="text-sm opacity-80">{msg}</p>}
      </div>
    </div>
  );
}
