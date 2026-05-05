import { useCallback, useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { toast } from 'sonner';
import { text } from '@site/src/website/components/shared/i18n';
import { clearSession, getStoredSession } from './useVotingAuth';

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

type VotingState = 'loading' | 'authenticated' | 'error';

type StateResponse = {
  user: UserInfo;
  talks: Talk[];
  votedTalkIds: number[];
};

const WORKER_DOMAIN = 'http://localhost:8787';

export type UseVotingResult = {
  state: VotingState;
  user: UserInfo | null;
  talks: Talk[];
  votedTalkIds: Set<number>;
  error: string | null;
  castVote: (talkId: number) => Promise<boolean>;
  retractVote: (talkId: number) => Promise<boolean>;
  refetch: () => Promise<void>;
};

const fetchState = async (
  token: string,
  domain: string
): Promise<StateResponse | null> => {
  try {
    const res = await fetch(`${domain}/api/voting/state`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as StateResponse;
  } catch {
    return null;
  }
};

const storeAndReturn = (data: {
  access_token: string;
  refresh_token: string;
}) => {
  if (typeof window !== 'undefined') {
    const existing = getStoredSession();
    localStorage.setItem(
      'voting_session',
      JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: existing?.user ?? { id: 0, email: '', votes_remaining: 0 },
      })
    );
  }
};

export const useVoting = (): UseVotingResult => {
  const [state, setState] = useState<VotingState>('loading');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [talks, setTalks] = useState<Talk[]>([]);
  const [votedTalkIds, setVotedTalkIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const { siteConfig } = useDocusaurusContext();
  const domain =
    (siteConfig.customFields?.['workerDomain'] as string | undefined) ??
    WORKER_DOMAIN;

  const tryRefresh = useCallback(async (): Promise<boolean> => {
    const session = getStoredSession();
    if (!session?.refresh_token) return false;

    try {
      const res = await fetch(`${domain}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      if (!res.ok) return false;

      const data = (await res.json()) as {
        access_token: string;
        refresh_token: string;
      };

      storeAndReturn(data);
      return true;
    } catch {
      return false;
    }
  }, [domain]);

  const loadState = useCallback(
    async (token: string): Promise<boolean> => {
      const data = await fetchState(token, domain);
      if (!data) return false;

      if (typeof window !== 'undefined') {
        const existing = getStoredSession();
        if (existing) {
          localStorage.setItem(
            'voting_session',
            JSON.stringify({ ...existing, user: data.user })
          );
        }
      }

      setUser(data.user);
      setTalks(data.talks);
      setVotedTalkIds(new Set(data.votedTalkIds));
      return true;
    },
    [domain]
  );

  const refetch = useCallback(async () => {
    setState('loading');
    setError(null);

    const session = getStoredSession();
    if (!session) {
      setError('Please authenticate first');
      setState('error');
      return;
    }

    const loaded = await loadState(session.access_token);
    if (loaded) {
      setState('authenticated');
      return;
    }

    const refreshed = await tryRefresh();
    if (refreshed) {
      const newSession = getStoredSession();
      if (newSession && (await loadState(newSession.access_token))) {
        setState('authenticated');
        return;
      }
    }

    clearSession();
    const msg = text({ id: 'voting.page.error.generic' });
    setError(msg);
    setState('error');
  }, [loadState, tryRefresh]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const withTokenRefresh = useCallback(
    async <T>(
      fn: (token: string) => Promise<{ ok: boolean; data?: T; status: number }>
    ): Promise<T | null> => {
      const session = getStoredSession();
      if (!session) return null;

      let result = await fn(session.access_token);

      if (result.status === 401) {
        const refreshed = await tryRefresh();
        if (!refreshed) {
          clearSession();
          window.location.href = '/';
          return null;
        }
        const newSession = getStoredSession();
        if (!newSession) {
          clearSession();
          window.location.href = '/';
          return null;
        }
        result = await fn(newSession.access_token);
      }

      return result.ok && result.data ? result.data : null;
    },
    [tryRefresh]
  );

  const castVote = useCallback(
    async (talkId: number): Promise<boolean> => {
      const makeRequest = async (token: string) => {
        const response = await fetch(`${domain}/api/voting/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ talk_id: talkId }),
        });
        const data = response.ok
          ? ((await response.json()) as { votes_remaining: number })
          : undefined;
        return { ok: response.ok, data, status: response.status };
      };

      const result = await withTokenRefresh(makeRequest);
      if (result === null) {
        toast.error(text({ id: 'voting.page.error.voteFailed' }));
        return false;
      }

      if (!result) return false;

      setUser((prev) =>
        prev ? { ...prev, votes_remaining: result.votes_remaining } : prev
      );
      setVotedTalkIds((prev) => new Set([...prev, talkId]));
      toast.success(text({ id: 'voting.page.voteSuccess' }));
      return true;
    },
    [domain, withTokenRefresh]
  );

  const retractVote = useCallback(
    async (talkId: number): Promise<boolean> => {
      const makeRequest = async (token: string) => {
        const response = await fetch(`${domain}/api/voting/vote`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ talk_id: talkId }),
        });
        const data = response.ok
          ? ((await response.json()) as { votes_remaining: number })
          : undefined;
        return { ok: response.ok, data, status: response.status };
      };

      const result = await withTokenRefresh(makeRequest);
      if (result === null) {
        toast.error(text({ id: 'voting.page.error.retractFailed' }));
        return false;
      }

      if (!result) return false;

      setUser((prev) =>
        prev ? { ...prev, votes_remaining: result.votes_remaining } : prev
      );
      setVotedTalkIds((prev) => {
        const next = new Set(prev);
        next.delete(talkId);
        return next;
      });
      toast.success(text({ id: 'voting.page.retractSuccess' }));
      return true;
    },
    [domain, withTokenRefresh]
  );

  return {
    state,
    user,
    talks,
    votedTalkIds,
    error,
    castVote,
    retractVote,
    refetch,
  };
};
