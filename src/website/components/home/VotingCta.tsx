import { useState } from 'react';
import { RefreshCw, Vote } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
import { VotingAuthModal } from '@site/src/website/components/voting/VotingAuthModal';
import { useVotingAuth } from '@site/src/website/hooks/voting/useVotingAuth';

export const VotingCta = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { tryAutoRefresh } = useVotingAuth();

  const handleClick = async () => {
    setIsRefreshing(true);
    const ok = await tryAutoRefresh();
    setIsRefreshing(false);

    if (ok) {
      window.location.href = '/voting';
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      <section className='voting-cta-section'>
        <div className='content'>
          <div className='voting-cta-badge'>
            <Vote size={16} />
            <Text id='voting.cta.title' />
          </div>
          <p className='voting-cta-description'>
            <Text id='voting.cta.description' />
          </p>
          <button
            type='button'
            className='voting-cta-button'
            onClick={handleClick}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw size={18} className='voting-cta-spinner' />
            ) : (
              <Vote size={18} />
            )}
            <Text id='voting.cta.label' />
          </button>
        </div>
      </section>

      {modalOpen && <VotingAuthModal onClose={() => setModalOpen(false)} />}
    </>
  );
};
