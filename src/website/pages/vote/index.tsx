import { useCallback, useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { toast } from 'sonner';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { Page } from '@site/src/website/components/shared/Page';
import {
  audienceLevels,
  durationOptions,
} from '@site/src/website/contexts/c4p/definitions';

type Talk = {
  id: number;
  title: string;
  description: string;
  speaker_name: string;
  duration: number;
  audience_level: number;
};

type Session = {
  budget: number;
  used: number;
  talks: Talk[];
  myVotes: number[];
  closesAt: string;
};

// Callback ?error= code -> translation id for the message surfaced on the vote page.
const LOGIN_ERROR_IDS = {
  denied: 'login.error.denied',
  state: 'login.error.state',
  token: 'login.error.token',
  identity: 'login.error.identity',
  notattendee: 'login.error.notattendee',
} as const;

const Vote = () => {
  const { siteConfig, i18n } = useDocusaurusContext();
  const locale = i18n.currentLocale;
  const workerDomain = siteConfig.customFields?.['workerDomain'] as
    | string
    | undefined;

  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<
    'loading' | 'ready' | 'unauth' | 'error'
  >('loading');
  const [votes, setVotes] = useState<Set<number>>(new Set());

  // Surface a login failure bounced back from the callback, then strip it from the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (!error) return;
    const id =
      LOGIN_ERROR_IDS[error as keyof typeof LOGIN_ERROR_IDS] ??
      'login.error.generic';
    toast.error(text({ id }));
    params.delete('error');
    const query = params.toString();
    window.history.replaceState(
      {},
      '',
      window.location.pathname + (query ? `?${query}` : '')
    );
  }, []);

  useEffect(() => {
    if (!workerDomain) return setStatus('error');
    fetch(`${workerDomain}/api/vote`, { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403)
          return setStatus('unauth');
        if (!res.ok) return setStatus('error');
        const data = (await res.json()) as Session;
        setSession(data);
        setVotes(new Set(data.myVotes));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [workerDomain]);

  const closed = session
    ? new Date(session.closesAt).getTime() < Date.now()
    : false;

  const toggle = useCallback(
    async (talkId: number) => {
      if (!session || closed) return;
      const has = votes.has(talkId);
      if (!has && votes.size >= session.budget) {
        toast.error(
          text({ id: 'vote.limitReached' }, { budget: session.budget })
        );
        return;
      }

      // ponytail: optimistic toggle; revert on failure. No queue/debounce — one vote per click.
      const next = new Set(votes);
      if (has) next.delete(talkId);
      if (!has) next.add(talkId);
      setVotes(next);

      const res = await fetch(`${workerDomain}/api/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ talkId, action: has ? 'remove' : 'add' }),
      }).catch(() => null);

      if (!res || !res.ok) {
        setVotes(votes);
        toast.error(text({ id: 'vote.submitError' }));
      }
    },
    [session, votes, workerDomain, closed]
  );

  return (
    <Page title={text({ id: 'vote.title' })}>
      <div className='page-content flex w-full max-w-[80rem] flex-col gap-[1.6rem] px-[2rem] py-[4rem]'>
        <h1>
          <Text id='vote.heading' />
        </h1>

        {status === 'loading' && (
          <p>
            <Text id='common.loading' />
          </p>
        )}
        {status === 'error' && (
          <p>
            <Text id='vote.loadError' />
          </p>
        )}
        {status === 'unauth' && (
          <a
            className='button button--primary'
            href={`${workerDomain}/api/vote/login`}
          >
            <Text id='auth.login' />
          </a>
        )}

        {status === 'ready' && session && (
          <>
            <div className='flex items-center justify-between gap-[1.2rem]'>
              {closed ? (
                <p>
                  <Text id='vote.closed' />
                </p>
              ) : (
                <p>
                  <Text
                    id='vote.remaining'
                    values={{
                      remaining: session.budget - votes.size,
                      budget: session.budget,
                    }}
                  />
                  <br />
                  <small>
                    <Text
                      id='vote.openUntil'
                      values={{
                        date: new Date(session.closesAt).toLocaleString(locale),
                      }}
                    />
                  </small>
                </p>
              )}
              <a
                className='button button--secondary button--sm'
                href={`${workerDomain}/api/vote/logout`}
              >
                <Text id='auth.logout' />
              </a>
            </div>
            <ul className='flex flex-col gap-[1.2rem]'>
              {session.talks.map((talk) => (
                <li key={talk.id}>
                  <label className='flex cursor-pointer gap-[0.8rem]'>
                    <input
                      type='checkbox'
                      checked={votes.has(talk.id)}
                      disabled={closed}
                      onChange={() => toggle(talk.id)}
                    />
                    <span>
                      <strong>{talk.title}</strong> — {talk.speaker_name}
                      <br />
                      <small>
                        {durationOptions[talk.duration]?.label} ·{' '}
                        {audienceLevels[talk.audience_level]?.label}
                      </small>
                      <br />
                      {talk.description}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Page>
  );
};

export default Vote;
