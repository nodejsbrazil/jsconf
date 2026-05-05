import type { Talk } from '@site/src/website/hooks/voting/useVoting';
import { useState } from 'react';
import { RefreshCw, Vote } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
import { Page } from '@site/src/website/components/shared/Page';
import { TalkCard } from '@site/src/website/components/voting/TalkCard';
import { TalkDetailModal } from '@site/src/website/components/voting/TalkDetailModal';
import { useVoting } from '@site/src/website/hooks/voting/useVoting';

const VotingContent = () => {
  const {
    state,
    user,
    talks,
    votedTalkIds,
    error,
    castVote,
    retractVote,
    refetch,
  } = useVoting();
  const [pendingTalkId, setPendingTalkId] = useState<number | null>(null);
  const [selectedTalk, setSelectedTalk] = useState<Talk | null>(null);

  if (state === 'loading') {
    return (
      <div className='voting-loading'>
        <div className='voting-spinner' />
        <Text id='voting.page.loading' />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className='voting-error-state'>
        <p className='voting-error-message'>{error}</p>
        <button
          type='button'
          className='voting-retry'
          onClick={() => {
            void refetch();
          }}
        >
          <RefreshCw size={16} />
          <Text id='voting.page.retry' />
        </button>
      </div>
    );
  }

  return (
    <>
      <header className='voting-header'>
        <div className='voting-user-info'>
          <span className='voting-email'>{user?.email}</span>
          <span className='voting-votes-badge'>
            <Text
              id='voting.page.votesRemaining'
              values={{ count: user?.votes_remaining ?? 0 }}
            />
          </span>
        </div>
      </header>

      {user?.votes_remaining === 0 && (
        <div className='voting-no-votes-banner'>
          <Text id='voting.page.noVotesLeft' />
        </div>
      )}

      {talks.length === 0 ? (
        <div className='voting-empty'>
          <Text id='voting.page.noTalks' />
        </div>
      ) : (
        <div className='voting-talks-grid'>
          {talks.map((talk) => (
            <div
              key={talk.id}
              className='talk-card-wrapper'
              onClick={() => {
                setSelectedTalk(talk);
              }}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setSelectedTalk(talk);
              }}
            >
              <TalkCard
                talk={talk}
                hasVoted={votedTalkIds.has(talk.id)}
                canVote={(user?.votes_remaining ?? 0) > 0}
                onVote={async () => {
                  setPendingTalkId(talk.id);
                  await castVote(talk.id);
                  setPendingTalkId(null);
                }}
                onRetract={async () => {
                  setPendingTalkId(talk.id);
                  await retractVote(talk.id);
                  setPendingTalkId(null);
                }}
                loading={pendingTalkId === talk.id}
              />
            </div>
          ))}
        </div>
      )}

      <TalkDetailModal
        talk={selectedTalk}
        canVote={(user?.votes_remaining ?? 0) > 0}
        hasVoted={selectedTalk ? votedTalkIds.has(selectedTalk.id) : false}
        onVote={async () => {
          if (!selectedTalk) return;
          setPendingTalkId(selectedTalk.id);
          await castVote(selectedTalk.id);
          setPendingTalkId(null);
        }}
        onRetract={async () => {
          if (!selectedTalk) return;
          setPendingTalkId(selectedTalk.id);
          await retractVote(selectedTalk.id);
          setPendingTalkId(null);
        }}
        onClose={() => {
          setSelectedTalk(null);
        }}
      />
    </>
  );
};

export const VotingPage = () => (
  <Page description='Votação - JSConf Brasil 2026'>
    <div className='voting-page'>
      <h1 className='voting-page-title'>
        <Vote size={28} />
        <Text id='voting.page.title' />
      </h1>
      <VotingContent />
    </div>
  </Page>
);
