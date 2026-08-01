import type { SubmitEventHandler } from 'react';
import { useRef, useState } from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Mail, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Text, text } from '@site/src/website/components/shared/i18n';
import Logo from '../../assets/img/logo.svg';
import { useScroll } from '../../hooks/useScroll';

const emailSchema = z.email().max(254);

export const Waitlist = () => {
  const { siteConfig } = useDocusaurusContext();
  const { search } = useLocation();
  const utmSource = new URLSearchParams(search).get('utm_source');
  const workerDomain = siteConfig.customFields?.['workerDomain'];
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const submitting = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useScroll(ref, (isVisible, target) => {
    target.className = isVisible ? 'content show' : 'content';
  });

  if (typeof workerDomain !== 'string') return null;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (submitting.current) return;

    if (!emailSchema.safeParse(email).success) {
      toast.error(text({ id: 'home.waitlist.invalid' }));
      return;
    }

    submitting.current = true;

    const API = `${workerDomain}/api/waitlist`;

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          website: honeypot,
          ...(utmSource && { utmSource }),
        }),
      });

      if (!res.ok) {
        toast.error(text({ id: 'home.waitlist.error' }));
      } else {
        toast.success(text({ id: 'home.waitlist.success' }));
        setEmail('');
      }
    } catch {
      toast.error(text({ id: 'home.waitlist.error' }));
    } finally {
      submitting.current = false;
    }
  };

  return (
    <section id='waitlist' className='landing-section'>
      <div ref={ref} className='content'>
        <div className='logo'>
          <Logo
            aria-label={text({ id: 'navbar.aria.logo' })}
            title={text({ id: 'navbar.aria.logo' })}
          />
        </div>
        <h2 className='title'>
          <Text id='home.waitlist.heading' />
        </h2>
        <p className='subtitle'>
          <Text id='home.waitlist.subheading' />
        </p>
        <form className='waitlist-form' onSubmit={handleSubmit} noValidate>
          {/* Bot Honeypot */}
          <input
            type='text'
            name='website'
            className='waitlist-website'
            value={honeypot}
            onChange={(e) => setHoneypot(e.currentTarget.value.trim())}
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
              onChange={(e) => setEmail(e.currentTarget.value.trim())}
              autoComplete='email'
            />
          </div>
          <button type='submit' className='waitlist-submit'>
            <span>
              <MailCheck className='icon' /> <Text id='home.waitlist.submit' />
            </span>
          </button>
        </form>
      </div>
    </section>
  );
};
