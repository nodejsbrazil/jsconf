import type { SubmitEventHandler } from 'react';
import { useState } from 'react';
import Translate, { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Mail } from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

const extractMetadataFromQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  return utmSource ? { utmSource } : Object.create(null);
};

export const Waitlist = () => {
  const { siteConfig } = useDocusaurusContext();
  const workerDomain = siteConfig.customFields?.['workerDomain'] as string;
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [state, setState] = useState<FormState>('idle');

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (state === 'loading' || state === 'success') return;
    setState('loading');

    try {
      const res = await fetch(`${workerDomain}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          website: honeypot,
          ...extractMetadataFromQueryParams(),
        }),
      });

      if (!res.ok) {
        setState('error');
      } else {
        setState('success');
        setEmail('');
      }
    } catch {
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <section className='waitlist'>
        <p className='waitlist-feedback success'>
          <Translate id='home.waitlist.success'>
            Você está na lista! Avisaremos quando abrir novidades.
          </Translate>
        </p>
      </section>
    );
  }

  return (
    <section className='waitlist'>
      <label className='waitlist-label' htmlFor='waitlist-email'>
        <Translate id='home.waitlist.label'>
          Receba novidades em primeira mão
        </Translate>
      </label>
      <form className='waitlist-form' onSubmit={handleSubmit} noValidate>
        {/* Honeypot: visually hidden, only bots fill this */}
        <input
          type='text'
          name='website'
          className='waitlist-website'
          value={honeypot}
          onChange={(e) => setHoneypot(e.currentTarget.value)}
          tabIndex={-1}
          autoComplete='off'
          aria-hidden='true'
        />
        <div className='waitlist-input-wrapper'>
          <Mail className='waitlist-input-icon' aria-hidden />
          <input
            id='waitlist-email'
            type='email'
            className='waitlist-input'
            placeholder={translate({
              id: 'home.waitlist.placeholder',
              message: 'seu@email.com',
            })}
            required
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            disabled={state === 'loading'}
            autoComplete='email'
          />
        </div>
        <button
          type='submit'
          className='waitlist-submit'
          disabled={state === 'loading'}
        >
          {state === 'loading' ? (
            <Translate id='home.waitlist.submitting'>Enviando...</Translate>
          ) : (
            <Translate id='home.waitlist.submit'>Entrar na lista</Translate>
          )}
        </button>
      </form>
      {state === 'error' && (
        <p className='waitlist-feedback error'>
          <Translate id='home.waitlist.error'>
            Algo deu errado. Tente novamente mais tarde.
          </Translate>
        </p>
      )}
    </section>
  );
};
