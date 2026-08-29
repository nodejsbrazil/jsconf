import { useCallback, useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { BarChart3, History, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { Page } from '@site/src/website/components/shared/Page';
import '@site/src/website/scss/pages/voting.scss';
import '@site/src/website/scss/pages/admin.scss';

type TalkCount = { talkId: number; title: string; votes: number };

type VoteDetail = {
  userId: string;
  name: string | null;
  tier: string | null;
  budget: number;
  position: number;
  votedAt: string;
};

type AuditEntry = {
  actorId: string;
  actorName: string | null;
  action: 'remove';
  userId: string;
  talkId: number;
  title: string | null;
  at: string;
};

type VoterDetail = {
  userId: string;
  name: string | null;
  tier: string | null;
  budget: number;
  votes: {
    talkId: number;
    title: string | null;
    position: number;
    votedAt: string;
  }[];
};

type Status = 'loading' | 'ready' | 'unauth' | 'forbidden' | 'error';

const AdminVotes = () => {
  const { siteConfig, i18n } = useDocusaurusContext();
  const locale = i18n.currentLocale;
  const workerDomain = siteConfig.customFields?.['workerDomain'] as
    | string
    | undefined;

  const [status, setStatus] = useState<Status>('loading');
  const [talks, setTalks] = useState<TalkCount[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<TalkCount | null>(null);
  const [details, setDetails] = useState<VoteDetail[] | null>(null);
  const [rosterAvailable, setRosterAvailable] = useState(true);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [auditOpen, setAuditOpen] = useState(false);
  // The per-voter view replaces the per-talk panel while it is open, so only one of the two is
  // ever on screen and the panel never has to decide which drill-down wins.
  const [voter, setVoter] = useState<VoterDetail | null>(null);
  const [voterLoading, setVoterLoading] = useState(false);

  const loadSummary = useCallback(async (): Promise<void> => {
    if (!workerDomain) return setStatus('error');
    const res = await fetch(`${workerDomain}/api/admin/votes`, {
      credentials: 'include',
    }).catch(() => null);
    if (!res) return setStatus('error');
    if (res.status === 401) return setStatus('unauth');
    if (res.status === 403) return setStatus('forbidden');
    if (!res.ok) return setStatus('error');
    const data = (await res.json()) as { talks: TalkCount[]; total: number };
    setTalks(data.talks);
    setTotal(data.total);
    setStatus('ready');
  }, [workerDomain]);

  const loadAudit = useCallback(async (): Promise<void> => {
    const res = await fetch(`${workerDomain}/api/admin/audit`, {
      credentials: 'include',
    }).catch(() => null);
    if (!res?.ok) return;
    const data = (await res.json()) as { entries: AuditEntry[] };
    setAudit(data.entries);
  }, [workerDomain]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  // Kept separate from the summary so the drawer can refresh on its own after a removal.
  const loadDetails = useCallback(
    async (talkId: number): Promise<void> => {
      setDetails(null);
      const res = await fetch(
        `${workerDomain}/api/admin/votes/detail?talkId=${talkId}`,
        { credentials: 'include' }
      ).catch(() => null);
      if (!res?.ok) {
        toast.error(text({ id: 'admin.detailError' }));
        setDetails([]);
        return;
      }
      const data = (await res.json()) as {
        votes: VoteDetail[];
        rosterAvailable: boolean;
      };
      setDetails(data.votes);
      setRosterAvailable(data.rosterAvailable);
    },
    [workerDomain]
  );

  const open = useCallback(
    (talk: TalkCount): void => {
      setVoter(null);
      setSelected(talk);
      void loadDetails(talk.talkId);
    },
    [loadDetails]
  );

  const openVoter = useCallback(
    async (userId: string): Promise<void> => {
      setVoterLoading(true);
      const res = await fetch(
        `${workerDomain}/api/admin/votes/voter?userId=${encodeURIComponent(userId)}`,
        { credentials: 'include' }
      ).catch(() => null);
      setVoterLoading(false);
      if (!res?.ok) {
        toast.error(text({ id: 'admin.voterError' }));
        return;
      }
      setVoter((await res.json()) as VoterDetail);
    },
    [workerDomain]
  );

  const remove = useCallback(
    async (vote: VoteDetail): Promise<void> => {
      if (!selected) return;
      const who = vote.name ?? vote.userId;
      // Deleting someone's vote is not reversible from this screen, so it asks first.
      if (!window.confirm(text({ id: 'admin.removeConfirm' }, { name: who })))
        return;

      const res = await fetch(`${workerDomain}/api/admin/votes/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: vote.userId,
          talkId: selected.talkId,
        }),
      }).catch(() => null);

      if (!res?.ok) {
        toast.error(text({ id: 'admin.removeError' }));
        return;
      }
      toast.success(text({ id: 'admin.removeSuccess' }));
      // Both lists come from the server again: the count in the table has to agree with the drawer.
      // The audit log only refetches when its panel is open, since the API budget is per IP and
      // fetching a list nobody is looking at spends it for nothing.
      await Promise.all([
        loadDetails(selected.talkId),
        loadSummary(),
        ...(auditOpen ? [loadAudit()] : []),
      ]);
    },
    [selected, workerDomain, loadDetails, loadSummary, loadAudit, auditOpen]
  );

  const toggleAudit = useCallback((): void => {
    setAuditOpen((current) => {
      if (!current) void loadAudit();
      return !current;
    });
  }, [loadAudit]);

  const formatDate = (value: string): string =>
    // D1 writes `datetime('now')` as a space-separated UTC string with no zone marker; without the
    // 'Z' the browser would read it as local time and shift every timestamp.
    new Date(`${value.replace(' ', 'T')}Z`).toLocaleString(locale);

  return (
    <Page title={text({ id: 'admin.title' })} noindex>
      <div className='admin-page page-content'>
        <header className='page-hero'>
          <h1 className='title'>
            <BarChart3 className='icon' aria-hidden />
            <Text id='admin.heading' />
          </h1>
          <p className='subtitle'>
            <Text id='admin.subheading' />
          </p>
        </header>

        {status === 'loading' && (
          <p className='status'>
            <Text id='common.loading' />
          </p>
        )}
        {status === 'error' && (
          <p className='status error'>
            <Text id='admin.loadError' />
          </p>
        )}
        {status === 'forbidden' && (
          <p className='status error'>
            <Text id='admin.forbidden' />
          </p>
        )}
        {status === 'unauth' && (
          <div className='login-hero'>
            <h2 className='login-title'>
              <Text id='admin.loginHeading' />
            </h2>
            <p className='login-text'>
              <Text id='admin.loginPrompt' />
            </p>
            <a className='login-cta' href={`${workerDomain}/api/vote/login`}>
              <Text id='auth.login' />
            </a>
          </div>
        )}

        {status === 'ready' && (
          <div className='admin-layout'>
            <section className='admin-main'>
              <div className='admin-toolbar'>
                <p className='admin-total'>
                  <Text
                    id='admin.totalVotes'
                    values={{ total, talks: talks.length }}
                  />
                </p>
                <button
                  type='button'
                  className='button button--secondary button--sm audit-toggle'
                  onClick={toggleAudit}
                  aria-expanded={auditOpen}
                >
                  <History className='icon' aria-hidden />
                  <Text id='admin.auditToggle' />
                </button>
              </div>

              {talks.length === 0 && (
                <p className='status'>
                  <Text id='admin.emptyTalks' />
                </p>
              )}

              {talks.length > 0 && (
                <div className='table-wrapper'>
                  <table className='votes-table'>
                    <thead>
                      <tr>
                        <th scope='col'>#</th>
                        <th scope='col'>
                          <Text id='admin.colTalk' />
                        </th>
                        <th scope='col' className='numeric'>
                          <Text id='admin.colVotes' />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {talks.map((talk) => (
                        <tr
                          key={talk.talkId}
                          className={
                            selected?.talkId === talk.talkId ? 'selected' : ''
                          }
                        >
                          <td className='talk-id'>{talk.talkId}</td>
                          <td className='talk-title'>{talk.title}</td>
                          <td className='numeric'>
                            {/* A button, not a click handler on the cell, so the drill-down is
                                reachable by keyboard and announced as an action. */}
                            <button
                              type='button'
                              className='votes-cell'
                              onClick={() => open(talk)}
                              aria-label={text(
                                { id: 'admin.viewVotersFor' },
                                { title: talk.title }
                              )}
                            >
                              {talk.votes}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {auditOpen && (
                <section className='audit-log'>
                  <h2 className='audit-title'>
                    <History className='icon' aria-hidden />
                    <Text id='admin.auditHeading' />
                  </h2>
                  {audit.length === 0 && (
                    <p className='status'>
                      <Text id='admin.auditEmpty' />
                    </p>
                  )}
                  {audit.length > 0 && (
                    <ul className='audit-list'>
                      {audit.map((entry, index) => (
                        <li key={`${entry.at}-${index}`}>
                          <span className='audit-when'>
                            {formatDate(entry.at)}
                          </span>
                          <span className='audit-what'>
                            <Text
                              id='admin.auditRemoved'
                              values={{
                                actor: entry.actorName ?? entry.actorId,
                                user: entry.userId,
                                talk: entry.title ?? `#${entry.talkId}`,
                              }}
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </section>

            {(voter || voterLoading) && (
              <aside className='voters-panel' aria-live='polite'>
                <div className='voters-head'>
                  <div>
                    <p className='voters-label'>
                      <Text id='admin.votesFrom' />
                    </p>
                    <h2 className='voters-title'>
                      {voter?.name ?? voter?.userId}
                    </h2>
                    {voter && (
                      <p className='voter-summary'>
                        <span className='voter-tier'>
                          {voter.tier ?? <Text id='admin.noTier' />}
                        </span>{' '}
                        <span className='voter-position'>
                          <Text
                            id='admin.votesUsed'
                            values={{
                              used: voter.votes.length,
                              budget: voter.budget,
                            }}
                          />
                        </span>
                      </p>
                    )}
                  </div>
                  <button
                    type='button'
                    className='voters-close'
                    onClick={() => setVoter(null)}
                    aria-label={text({ id: 'admin.close' })}
                  >
                    <X className='icon' aria-hidden />
                  </button>
                </div>

                {voterLoading && (
                  <p className='status'>
                    <Text id='common.loading' />
                  </p>
                )}

                {voter && voter.votes.length > 0 && (
                  <ul className='voters-list'>
                    {voter.votes.map((vote) => (
                      <li key={vote.talkId} className='voter-row'>
                        <div className='voter-main'>
                          <span className='voter-name-static'>
                            {vote.title ?? `#${vote.talkId}`}
                          </span>
                          <span className='voter-id'>#{vote.talkId}</span>
                        </div>
                        <div className='voter-meta'>
                          <span className='voter-position'>
                            <Text
                              id='admin.votePosition'
                              values={{
                                position: vote.position,
                                budget: voter.budget,
                              }}
                            />
                          </span>
                          <span className='voter-date'>
                            {formatDate(vote.votedAt)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>
            )}

            {selected && !voter && !voterLoading && (
              <aside className='voters-panel' aria-live='polite'>
                <div className='voters-head'>
                  <div>
                    <p className='voters-label'>
                      <Text id='admin.votersFor' />
                    </p>
                    <h2 className='voters-title'>{selected.title}</h2>
                  </div>
                  <button
                    type='button'
                    className='voters-close'
                    onClick={() => setSelected(null)}
                    aria-label={text({ id: 'admin.close' })}
                  >
                    <X className='icon' aria-hidden />
                  </button>
                </div>

                {!rosterAvailable && details && details.length > 0 && (
                  <p className='status error'>
                    <Text id='admin.rosterUnavailable' />
                  </p>
                )}

                {!details && (
                  <p className='status'>
                    <Text id='common.loading' />
                  </p>
                )}
                {details?.length === 0 && (
                  <p className='status'>
                    <Text id='admin.noVoters' />
                  </p>
                )}

                {details && details.length > 0 && (
                  <ul className='voters-list'>
                    {details.map((vote) => (
                      <li key={vote.userId} className='voter-row'>
                        <div className='voter-main'>
                          {/* A button so the per-voter drill-down is keyboard reachable and
                              announced as an action rather than as plain text. */}
                          <button
                            type='button'
                            className='voter-name'
                            onClick={() => void openVoter(vote.userId)}
                            aria-label={text(
                              { id: 'admin.seeAllVotesFrom' },
                              { name: vote.name ?? vote.userId }
                            )}
                          >
                            {vote.name ?? <Text id='admin.unknownMember' />}
                          </button>
                          <span className='voter-id'>{vote.userId}</span>
                        </div>
                        <div className='voter-meta'>
                          <span className='voter-tier'>
                            {vote.tier ?? <Text id='admin.noTier' />}
                          </span>
                          <span className='voter-position'>
                            <Text
                              id='admin.votePosition'
                              values={{
                                position: vote.position,
                                budget: vote.budget,
                              }}
                            />
                          </span>
                          <span className='voter-date'>
                            {formatDate(vote.votedAt)}
                          </span>
                        </div>
                        <button
                          type='button'
                          className='voter-remove'
                          onClick={() => void remove(vote)}
                          aria-label={text(
                            { id: 'admin.removeVoteFrom' },
                            { name: vote.name ?? vote.userId }
                          )}
                        >
                          <Trash2 className='icon' aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>
            )}
          </div>
        )}
      </div>
    </Page>
  );
};

export default AdminVotes;
