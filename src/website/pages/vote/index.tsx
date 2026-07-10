import { useCallback, useEffect, useRef, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  Circle,
  CircleCheckBig,
  Info,
  LogOut,
  Vote as VoteIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { Page } from '@site/src/website/components/shared/Page';
import {
  audienceLevels,
  durationOptions,
} from '@site/src/website/contexts/c4p/definitions';
import '@site/src/website/scss/pages/voting.scss';

type Talk = {
  id: number;
  title: string;
  description: string;
  duration: number;
  audience_level: number;
};

type Session = {
  budget: number;
  used: number;
  talks: (Talk & { speaker_name: string })[];
  myVotes: number[];
  closesAt: string;
};

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

// Fake, name-shaped (not real) placeholder shown blurred instead of the real speaker — the API
// never sends a speaker name, so this generates one purely for display. Computed once per fetch
// (not per render) so it doesn't change while toggling votes.
const fakeName = (): string =>
  Array.from({ length: 2 + Math.floor(Math.random() * 4) }, () => {
    const word = Array.from(
      { length: 3 + Math.floor(Math.random() * 8) },
      () => LETTERS[Math.floor(Math.random() * LETTERS.length)]
    ).join('');
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');

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
  // Queued talkId -> action, flushed 1s after the last toggle (resets on every new toggle) so a
  // burst of clicks becomes one wave of requests instead of one per click.
  const queueRef = useRef<Map<number, 'add' | 'remove'>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!workerDomain) return setStatus('error');
    fetch(`${workerDomain}/api/vote`, { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403)
          return setStatus('unauth');
        if (!res.ok) return setStatus('error');
        const data = (await res.json()) as Omit<Session, 'talks'> & {
          talks: Talk[];
        };
        setSession({
          ...data,
          talks: data.talks.map((talk) => ({
            ...talk,
            speaker_name: fakeName(),
          })),
        });
        setVotes(new Set(data.myVotes));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [workerDomain]);

  const closed = session
    ? new Date(session.closesAt).getTime() < Date.now()
    : false;

  // Sends every queued talkId's LATEST desired action once the 1s idle window elapses.
  const flush = useCallback(async () => {
    const actions = Array.from(queueRef.current.entries());
    queueRef.current.clear();
    for (const [talkId, action] of actions) {
      const res = await fetch(`${workerDomain}/api/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ talkId, action }),
      }).catch(() => null);

      if (!res || !res.ok) {
        setVotes((current) => {
          const copy = new Set(current);
          if (action === 'add') copy.delete(talkId);
          if (action === 'remove') copy.add(talkId);
          return copy;
        });
        toast.error(text({ id: 'vote.submitError' }));
      }
    }
  }, [workerDomain]);

  const toggle = useCallback(
    (talkId: number) => {
      if (!session || closed) return;
      const has = votes.has(talkId);
      if (!has && votes.size >= session.budget) {
        toast.error(
          text({ id: 'vote.limitReached' }, { budget: session.budget })
        );
        return;
      }

      // ponytail: optimistic toggle; queued and debounced (1s idle) so a burst of clicks across
      // any number of cards becomes one wave of requests instead of one per click.
      const next = new Set(votes);
      if (has) next.delete(talkId);
      if (!has) next.add(talkId);
      setVotes(next);
      queueRef.current.set(talkId, has ? 'remove' : 'add');

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(flush, 1000);
    },
    [session, votes, flush, closed]
  );

  return (
    <Page title={text({ id: 'vote.title' })}>
      <div className='vote-page page-content'>
        <header className='page-hero'>
          <h1 className='title'>
            <VoteIcon className='icon' aria-hidden />
            <Text id='vote.heading' />
          </h1>
          <p className='subtitle'>
            <Text id='vote.subheading' />
          </p>
        </header>

        {status === 'loading' && (
          <p className='status'>
            <Text id='common.loading' />
          </p>
        )}
        {status === 'error' && (
          <p className='status error'>
            <Text id='vote.loadError' />
          </p>
        )}
        {status === 'unauth' && (
          <div className='login-hero'>
            <h2 className='login-title'>
              <Text id='vote.loginHeading' />
            </h2>
            <p className='login-text'>
              <Text id='vote.loginPrompt' />
            </p>
            <a className='login-cta' href={`${workerDomain}/api/vote/login`}>
              <Text id='auth.login' />
            </a>
          </div>
        )}

        {status === 'ready' && session && (
          <>
            <div className='budget-bar'>
              <div className='budget-info'>
                {closed ? (
                  <span className='closed-badge'>
                    <Text id='vote.closedHeading' />
                  </span>
                ) : (
                  <>
                    <span className='count'>{session.budget - votes.size}</span>
                    <span className='label'>
                      <Text
                        id='vote.remaining'
                        values={{
                          remaining: session.budget - votes.size,
                          budget: session.budget,
                        }}
                      />
                    </span>
                    <span className='deadline'>
                      <Text
                        id='vote.openUntil'
                        values={{
                          date: new Date(session.closesAt).toLocaleString(
                            locale
                          ),
                        }}
                      />
                    </span>
                  </>
                )}
              </div>
              <a
                className='button button--secondary button--sm logout-link'
                href={`${workerDomain}/api/vote/logout`}
              >
                <LogOut className='icon' aria-hidden />
                <Text id='auth.logout' />
              </a>
            </div>

            <aside className='info-banner'>
              <Info className='icon' aria-hidden />
              <div className='info-text'>
                <strong>
                  <Text id='vote.hideAuthorsTitle' />
                </strong>
                <p>
                  <Text id='vote.hideAuthorsBody' />
                </p>
              </div>
            </aside>

            {closed && (
              <p className='closed-note'>
                <Text id='vote.closed' />
              </p>
            )}

            {session.talks.length === 0 && (
              <p className='status'>
                <Text id='vote.emptyTalks' />
              </p>
            )}

            <ul className='talks-grid'>
              {session.talks.map((talk) => {
                const duration = durationOptions[talk.duration];
                const audience = audienceLevels[talk.audience_level];
                const voted = votes.has(talk.id);
                const budgetOut = !voted && votes.size >= session.budget;
                return (
                  <li
                    key={talk.id}
                    className={[
                      'talk-card',
                      voted && 'voted',
                      budgetOut && 'budget-out',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className='talk-head'>
                      <h3 className='talk-title'>{talk.title}</h3>
                      <div className='talk-meta'>
                        {duration && (
                          <span>
                            <Text id={duration.labelId} />
                          </span>
                        )}
                        {audience && (
                          <span>
                            <Text id={audience.labelId} />
                          </span>
                        )}
                      </div>
                    </div>
                    <p className='talk-speaker'>
                      <Text id='vote.by' />{' '}
                      <span className='speaker-name'>{talk.speaker_name}</span>
                    </p>
                    <p className='talk-description'>{talk.description}</p>
                    <button
                      type='button'
                      className={voted ? 'vote-toggle voted' : 'vote-toggle'}
                      disabled={closed || budgetOut}
                      onClick={() => toggle(talk.id)}
                    >
                      {voted ? (
                        <CircleCheckBig className='icon' aria-hidden />
                      ) : (
                        <Circle className='icon' aria-hidden />
                      )}
                      <Text
                        id={voted ? 'vote.votedAction' : 'vote.voteAction'}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </Page>
  );
};

export default Vote;
