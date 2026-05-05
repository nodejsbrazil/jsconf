import type { Talk } from '@site/src/website/hooks/voting/useVoting';
import { Clock, ThumbsDown, ThumbsUp, Users } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';

type TalkCardProps = {
  talk: Talk;
  hasVoted: boolean;
  canVote: boolean;
  onVote: () => void;
  onRetract: () => void;
  loading: boolean;
};

const DURATION_LABELS = ['15 min', '25 min'];
const LEVEL_LABELS = ['Iniciante', 'Intermediário', 'Avançado'];

export const TalkCard = ({
  talk,
  hasVoted,
  canVote,
  onVote,
  onRetract,
  loading,
}: TalkCardProps) => {
  return (
    <article className='talk-card'>
      <div className='talk-card-header'>
        <h3 className='talk-title'>{talk.title}</h3>
        <div className='talk-meta'>
          <span className='talk-meta-item'>
            <Users size={14} />
            {talk.speaker_name}
          </span>
          <span className='talk-meta-item'>
            <Clock size={14} />
            {DURATION_LABELS[talk.duration] ?? `${talk.duration} min`}
          </span>
          <span className='talk-badge'>
            {LEVEL_LABELS[talk.audience_level - 1] ??
              `Nível ${talk.audience_level}`}
          </span>
        </div>
      </div>

      <p className='talk-description'>{talk.description}</p>

      <div className='talk-actions'>
        {hasVoted ? (
          <button
            type='button'
            className='talk-btn talk-btn-retract'
            onClick={(e) => {
              e.stopPropagation();
              onRetract();
            }}
            disabled={loading}
          >
            <ThumbsDown size={16} />
            <Text id='voting.page.talk.retract' />
          </button>
        ) : (
          <button
            type='button'
            className='talk-btn talk-btn-vote'
            onClick={(e) => {
              e.stopPropagation();
              onVote();
            }}
            disabled={!canVote || loading}
          >
            <ThumbsUp size={16} />
            <Text id='voting.page.talk.vote' />
          </button>
        )}
      </div>
    </article>
  );
};
