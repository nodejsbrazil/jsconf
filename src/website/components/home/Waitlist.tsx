import type { SubmitEventHandler } from 'react';
import { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Mail } from 'lucide-react';
import { Text, text } from '@site/src/website/components/shared/i18n';

type FormState = 'idle' | 'loading' | 'success' | 'error';

const extractMetadataFromQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  return utmSource ? { utmSource } : Object.create(null);
};

export const Waitlist = () => {
  const { siteConfig } = useDocusaurusContext();
  const workerDomain = siteConfig.customFields?.['workerDomain'];
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [state, setState] = useState<FormState>('idle');

  if (typeof workerDomain !== 'string') return null;

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
          <Text id='home.waitlist.success' />
        </p>
      </section>
    );
  }

  return (
    <section className='waitlist'>
      <label className='waitlist-label' htmlFor='waitlist-email'>
        <Text id='home.waitlist.label' />
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
            placeholder={text({ id: 'home.waitlist.placeholder' })}
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
            <Text id='home.waitlist.submitting' />
          ) : (
            <Text id='home.waitlist.submit' />
          )}
        </button>
      </form>
      {state === 'error' && (
        <p className='waitlist-feedback error'>
          <Text id='home.waitlist.error' />
        </p>
      )}
    </section>
  );
};
