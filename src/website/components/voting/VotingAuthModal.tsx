import { useState } from 'react';
import { X } from 'lucide-react';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { useVotingAuth } from '@site/src/website/hooks/voting/useVotingAuth';

type VotingAuthModalProps = {
  onClose: () => void;
};

type Step = 1 | 2;

export const VotingAuthModal = ({ onClose }: VotingAuthModalProps) => {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const { state, error, requestCode, authenticate, reset } = useVotingAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await requestCode(email);
    if (ok) setStep(2);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authenticate(code);
  };

  const handleBack = () => {
    reset();
    setStep(1);
    setEmail('');
    setCode('');
  };

  return (
    <div className='voting-modal-overlay' onClick={onClose}>
      <div className='voting-modal' onClick={(e) => e.stopPropagation()}>
        <button
          type='button'
          className='voting-modal-close'
          onClick={onClose}
          aria-label='Fechar'
        >
          <X size={20} />
        </button>

        <div className='voting-modal-header'>
          <h2>
            {step === 1 ? (
              <Text id='voting.modal.step1.title' />
            ) : (
              <Text id='voting.modal.step2.title' />
            )}
          </h2>
        </div>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className='voting-modal-form'>
            <div className='field'>
              <label htmlFor='voting-email'>
                <Text id='voting.modal.step1.email.label' />
              </label>
              <input
                id='voting-email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={text({
                  id: 'voting.modal.step1.email.placeholder',
                })}
                required
                className='voting-input'
                disabled={state === 'loading'}
              />
            </div>

            {error && <p className='voting-error'>{error}</p>}
            {state === 'success' && (
              <p className='voting-success'>
                <Text id='voting.modal.step1.success' />
              </p>
            )}

            <button
              type='submit'
              className='voting-submit'
              disabled={state === 'loading'}
            >
              {state === 'loading' ? (
                '...'
              ) : (
                <Text id='voting.modal.step1.submit' />
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className='voting-modal-form'>
            <div className='field'>
              <label htmlFor='voting-code'>
                <Text id='voting.modal.step2.code.label' />
              </label>
              <input
                id='voting-code'
                type='text'
                inputMode='numeric'
                pattern='[0-9]{4}'
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\f/g, ''))}
                placeholder={text({
                  id: 'voting.modal.step2.code.placeholder',
                })}
                required
                className='voting-input voting-input-code'
                disabled={state === 'loading'}
                autoFocus
              />
            </div>

            {error && <p className='voting-error'>{error}</p>}

            <button
              type='submit'
              className='voting-submit'
              disabled={state === 'loading'}
            >
              {state === 'loading' ? (
                '...'
              ) : (
                <Text id='voting.modal.step2.submit' />
              )}
            </button>

            <button type='button' className='voting-back' onClick={handleBack}>
              <Text id='voting.modal.back' />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
