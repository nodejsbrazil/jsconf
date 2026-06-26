import { useCallback, useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { toast } from 'sonner';
import { Page } from '@site/src/website/components/shared/Page';

type Talk = {
  id: number;
  title: string;
  description: string;
  speaker_name: string;
};

type Session = {
  budget: number;
  used: number;
  talks: Talk[];
  myVotes: number[];
  closesAt: string;
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
            <p>
              Votos restantes: {session.budget - votes.size} de {session.budget}
            </p>
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
