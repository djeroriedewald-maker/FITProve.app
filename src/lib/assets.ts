// src/lib/assets.ts
// Helper to choose between local and remote assets with environment overrides.

export type AssetPick = {
  primary: string;
  fallback?: string;
  placeholder?: string;
};

// Determine current mode: 'local' or 'remote'.
function currentMode(): 'local' | 'remote' {
  const envPref = (import.meta as any)?.env?.VITE_IMAGES_PRIMARY as
    | 'local'
    | 'remote'
    | undefined;
  if (envPref === 'local' || envPref === 'remote') return envPref;
  return (import.meta as any)?.env?.DEV ? 'local' : 'remote';
}

export function pickAsset(
  nameOrUrl: string,
  opts?: { remoteBase?: string; placeholder?: string }
): AssetPick {
  const baseUrl = ((import.meta as any)?.env?.BASE_URL as string) || '/';
  const placeholder =
    opts?.placeholder || `${baseUrl}images/hero.svg`;
  const remoteBase =
    opts?.remoteBase ||
    ((import.meta as any)?.env?.VITE_IMAGES_REMOTE_BASE as string) ||
    'https://fitprove.app/images/modules/';

  // Normalize and derive local/remote URLs
  const isRemote = /^https?:\/\//i.test(nameOrUrl);
  const name = nameOrUrl.split('?')[0].split('/').pop() || nameOrUrl;
  const local = `${baseUrl}images/${name}`;
  const remote = isRemote ? nameOrUrl : `${remoteBase}${name}`;

  const mode = currentMode();
  return {
    primary: mode === 'local' ? local : remote,
    fallback: mode === 'local' ? remote : local,
    placeholder,
  };
}

