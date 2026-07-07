import { useCallback, useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { toast } from 'sonner';
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

// Login failure messages surfaced from the OAuth callback's ?error= redirect.
const LOGIN_ERRORS: Record<string, string> = {
  denied: 'Login cancelado.',
  state: 'Sessão de login expirada. Tente novamente.',
  token: 'Falha ao autenticar com guild.host. Tente novamente.',
  identity: 'Não foi possível identificar sua conta guild.host.',
  notattendee: 'Você não possui um ingresso para o evento.',
};

const Vote = () => {
  const { siteConfig } = useDocusaurusContext();
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
    toast.error(LOGIN_ERRORS[error] ?? 'Erro ao entrar. Tente novamente.');
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

  const toggle = useCallback(
    async (talkId: number) => {
      if (!session) return;
      const has = votes.has(talkId);
      if (!has && votes.size >= session.budget) {
        toast.error(`Você já usou seus ${session.budget} votos.`);
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
        toast.error('Erro ao registrar voto. Tente novamente.');
      }
    },
    [session, votes, workerDomain]
  );

  return (
    <Page title='Votação - JSConf Brasil 2026'>
      <div className='page-content flex w-full max-w-[80rem] flex-col gap-[1.6rem] px-[2rem] py-[4rem]'>
        <h1>Vote nas palestras</h1>

        {status === 'loading' && <p>Carregando…</p>}
        {status === 'error' && (
          <p>Não foi possível carregar a votação. Tente mais tarde.</p>
        )}
        {status === 'unauth' && (
          <a
            className='button button--primary'
            href={`${workerDomain}/api/vote/login`}
          >
            Entrar com guild.host
          </a>
        )}

        {status === 'ready' && session && (
          <>
            <div className='flex items-center justify-between gap-[1.2rem]'>
              <p>
                Votos restantes: {session.budget - votes.size} de{' '}
                {session.budget}
              </p>
              <a
                className='button button--secondary button--sm'
                href={`${workerDomain}/api/vote/logout`}
              >
                Sair
              </a>
            </div>
            <ul className='flex flex-col gap-[1.2rem]'>
              {session.talks.map((talk) => (
                <li key={talk.id}>
                  <label className='flex cursor-pointer gap-[0.8rem]'>
                    <input
                      type='checkbox'
                      checked={votes.has(talk.id)}
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
