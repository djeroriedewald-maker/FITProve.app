import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../store/auth';

export default function Profile() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function handleLogout() {
    setErr(null);
    setBusy(true);
    try {
      await signOut();
      navigate('/');
    } catch (e) {
      setErr(t('profile.logoutError', 'Logout failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-5 space-y-4">
      <section className="card card-pad">
        <h1 className="text-xl font-extrabold">
          {t('profile.title', 'Profile')}
        </h1>

        <div className="mt-4 grid gap-3">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t('profile.status', 'Signed in')}
            </p>
            <p className="mt-1 font-semibold">
              {user?.name || t('profile.unknownName', 'Unknown user')}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {user?.email || t('profile.noEmail', 'No email on record')}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleLogout}
              disabled={busy}
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-fit-orange disabled:opacity-60"
            >
              {busy
                ? t('profile.loggingOut', 'Signing out…')
                : t('profile.logout', 'Log out')}
            </button>

            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              {t('profile.backHome', 'Back to Home')}
            </button>
          </div>

          {err && (
            <p className="text-sm text-red-500" role="alert" aria-live="polite">
              {err}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
