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
import { link } from '@site/src/website/configs/definitions';
import {
  audienceLevels,
  durationOptions,
} from '@site/src/website/contexts/c4p/definitions';
import {
  orderTalks,
  readDaySeed,
} from '@site/src/website/helpers/daily-shuffle';
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
  sympla: boolean;
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

  const load = useCallback(() => {
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
          // Ordered once, here, and then left alone: sorting off `data.myVotes` (the votes the
          // visitor arrived with) rather than the live `votes` state is what stops a card from
          // leaping to the top under the cursor the moment it's clicked. New votes reorder on
          // the next load. Purely how the list is drawn — every vote still travels as talk.id,
          // so a position never means anything to the API. Safe in an effect too: the
          // build-time render has no session and no list, so no server markup to disagree with.
          talks: orderTalks(
            data.talks,
            data.myVotes,
            locale,
            readDaySeed()
          ).map((talk) => ({
            ...talk,
            speaker_name: fakeName(),
          })),
        });
        setVotes(new Set(data.myVotes));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
    // `locale` only changes by navigating to another locale's route, which remounts this anyway.
  }, [workerDomain, locale]);

  useEffect(load, [load]);

  // Sympla buyers have no guild.host account: they log in with ticket number + ticket email. A
  // successful login sets the session cookie, so reloading the ballot is all that's left.
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);
  const ticketLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setTicketLoading(true);
    const res = await fetch(`${workerDomain}/api/vote/ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ticketNumber, email: ticketEmail }),
    }).catch(() => null);
    setTicketLoading(false);
    if (res?.ok) return load();
    if (res?.status === 422)
      return toast.error(text({ id: 'vote.ticket.invalid' }));
    toast.error(text({ id: 'vote.ticket.error' }));
  };

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

      // Optimistic toggle; queued and debounced (1s idle) so a burst of clicks across
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
    <Page title={text({ id: 'vote.title' })} noindex>
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
            <hr className='login-divider' />
            <h3 className='login-subtitle'>
              <Text id='vote.ticket.heading' />
            </h3>
            <p className='login-text'>
              <Text id='vote.ticket.prompt' />
            </p>
            <form className='ticket-form' onSubmit={ticketLogin}>
              <input
                className='ticket-input'
                aria-label={text({ id: 'vote.ticket.number' })}
                placeholder={text({ id: 'vote.ticket.number' })}
                inputMode='numeric'
                autoComplete='off'
                required
                value={ticketNumber}
                onChange={(event) => setTicketNumber(event.target.value)}
              />
              <input
                className='ticket-input'
                type='email'
                aria-label={text({ id: 'vote.ticket.email' })}
                placeholder={text({ id: 'vote.ticket.email' })}
                autoComplete='email'
                required
                value={ticketEmail}
                onChange={(event) => setTicketEmail(event.target.value)}
              />
              <button
                className='login-cta'
                type='submit'
                disabled={ticketLoading}
              >
                <Text id='vote.ticket.submit' />
              </button>
            </form>
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
              {session.talks.map((talk, index) => {
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
                    {/* Watermarked position, decorative only: it tracks the rendered slot, not
                        the talk id, so assistive tech is better off never hearing it. */}
                    <span className='talk-number' aria-hidden='true'>
                      {index + 1}
                    </span>
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

            {session.sympla && (
              <aside className='login-hero guild-invite'>
                <h2 className='login-title'>
                  <Text id='vote.guildInvite.title' />
                </h2>
                <p className='login-text'>
                  <Text id='vote.guildInvite.body' />
                </p>
                <a
                  className='login-cta'
                  href={link.guild}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Text id='vote.guildInvite.cta' />
                </a>
              </aside>
            )}
          </>
        )}
      </div>
    </Page>
  );
};

export default Vote;
