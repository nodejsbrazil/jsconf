import { useCallback, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { toast } from 'sonner';
import { text } from '@site/src/website/components/shared/i18n';

export type Talk = {
  id: number;
  title: string;
  description: string;
  speaker_name: string;
  duration: number;
  audience_level: number;
};

export type UserInfo = {
  id: number;
  email: string;
  votes_remaining: number;
};

export interface StoredSession {
  access_token: string;
  refresh_token: string;
  user: UserInfo;
}

type AuthState = 'idle' | 'loading' | 'success' | 'error' | 'authenticated';

export type UseVotingAuthResult = {
  state: AuthState;
  error: string | null;
  requestCode: (email: string) => Promise<boolean>;
  authenticate: (code: string) => Promise<boolean>;
  reset: () => void;
  tryAutoRefresh: () => Promise<boolean>;
};

const WORKER_DOMAIN = 'http://localhost:8787';
const STORAGE_KEY = 'voting_session';

export function getStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export const useVotingAuth = (): UseVotingAuthResult => {
  const [state, setState] = useState<AuthState>('idle');
  const [error, setError] = useState<string | null>(null);

  const { siteConfig } = useDocusaurusContext();
  const domain =
    (siteConfig.customFields?.['workerDomain'] as string | undefined) ??
    WORKER_DOMAIN;

  const requestCode = useCallback(
    async (email: string): Promise<boolean> => {
      setState('loading');
      setError(null);

      try {
        const response = await fetch(`${domain}/api/auth/request-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          const msg = data?.error ?? text({ id: 'voting.modal.step1.error' });
          setError(msg);
          setState('error');
          toast.error(msg);
          return false;
        }

        setState('success');
        return true;
      } catch {
        const msg = text({ id: 'voting.modal.step1.error' });
        setError(msg);
        setState('error');
        toast.error(msg);
        return false;
      }
    },
    [domain]
  );

  const authenticate = useCallback(
    async (code: string): Promise<boolean> => {
      setState('loading');
      setError(null);

      try {
        const response = await fetch(`${domain}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          let msg: string;
          if (response.status === 401 || response.status === 404) {
            msg = text({ id: 'voting.modal.step2.error.notFound' });
          } else {
            const data = (await response.json().catch(() => null)) as {
              error?: string;
            } | null;
            msg =
              data?.error ?? text({ id: 'voting.modal.step2.error.invalid' });
          }
          setError(msg);
          setState('error');
          toast.error(msg);
          return false;
        }

        const data = (await response.json()) as StoredSession;

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }

        setState('authenticated');

        const targetUrl = `${window.location.origin}/voting`;
        window.location.href = targetUrl;
        return true;
      } catch {
        const msg = text({ id: 'voting.modal.step2.error.invalid' });
        setError(msg);
        setState('error');
        toast.error(msg);
        return false;
      }
    },
    [domain]
  );

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
  }, []);

  const tryAutoRefresh = useCallback(async (): Promise<boolean> => {
    const session = getStoredSession();
    if (!session) return false;

    try {
      setState('loading');

      const response = await fetch(`${domain}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });

      if (!response.ok) {
        clearSession();
        setState('idle');
        return false;
      }

      const data = (await response.json()) as StoredSession;

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }

      setState('authenticated');
      return true;
    } catch {
      clearSession();
      setState('idle');
      return false;
    }
  }, [domain]);

  return { state, error, requestCode, authenticate, reset, tryAutoRefresh };
};
