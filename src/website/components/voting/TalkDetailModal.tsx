import type { Talk } from '@site/src/website/hooks/voting/useVoting';
import { useEffect } from 'react';
import { Clock, ThumbsDown, ThumbsUp, Users, X } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';

type TalkDetailModalProps = {
  talk: Talk | null;
  canVote: boolean;
  hasVoted: boolean;
  onVote: () => void;
  onRetract: () => void;
  onClose: () => void;
};

const DURATION_LABELS = ['15 min', '25 min'];
const LEVEL_LABELS = ['Iniciante', 'Intermediário', 'Avançado'];

export const TalkDetailModal = ({
  talk,
  canVote,
  hasVoted,
  onVote,
  onRetract,
  onClose,
}: TalkDetailModalProps) => {
  useEffect(() => {
    if (!talk) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [talk, onClose]);

  if (!talk) return null;

  return (
    <div className='talk-detail-overlay' onClick={onClose}>
      <div
        className='talk-detail-modal'
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          type='button'
          className='talk-detail-close'
          onClick={onClose}
          aria-label='Close'
        >
          <X size={20} />
        </button>

        <div className='talk-detail-header'>
          <h2>{talk.title}</h2>
          <span className='talk-detail-level'>
            {LEVEL_LABELS[talk.audience_level - 1] ??
              `Nível ${talk.audience_level}`}
          </span>
        </div>

        <div className='talk-detail-meta'>
          <span className='talk-detail-meta-item'>
            <Users size={15} />
            {talk.speaker_name}
          </span>
          <span className='talk-detail-meta-item'>
            <Clock size={15} />
            {DURATION_LABELS[talk.duration] ?? `${talk.duration} min`}
          </span>
        </div>

        <p className='talk-detail-description'>{talk.description}</p>

        {hasVoted ? (
          <button
            type='button'
            className='talk-detail-action talk-detail-action-retract'
            onClick={onRetract}
          >
            <ThumbsDown size={18} />
            <Text id='voting.page.talk.retract' />
          </button>
        ) : (
          <button
            type='button'
            className='talk-detail-action talk-detail-action-vote'
            onClick={onVote}
            disabled={!canVote}
          >
            <ThumbsUp size={18} />
            <Text id='voting.page.talk.vote' />
          </button>
        )}
      </div>
    </div>
  );
};
