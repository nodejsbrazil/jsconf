import type { SubmitEvent } from 'react';
import { useRef, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { toast } from 'sonner';
import { text } from '@site/src/website/components/shared/i18n';
import { useC4P } from '../../contexts/c4p';

export const useSubmit = () => {
  const { siteConfig } = useDocusaurusContext();
  const workerDomain = siteConfig.customFields?.['workerDomain'];
  const { formData, validate, goToStep } = useC4P();
  const submitting = useRef(false);
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (!validate() || submitting.current) return;

    if (typeof workerDomain !== 'string') {
      toast.error(text({ id: 'c4p.submit.configError' }));
      return;
    }

    submitting.current = true;

    try {
      const response = await fetch(`${workerDomain}/api/c4p`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, confirm_email: honeypot }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        const message =
          data?.error === 'Talk limit exceeded.'
            ? text({ id: 'c4p.submit.limit' })
            : text({ id: 'c4p.submit.error' });
        toast.error(message);
        return;
      }

      goToStep(5);
    } catch {
      toast.error(text({ id: 'c4p.submit.error' }));
    } finally {
      submitting.current = false;
    }
  };

  return { honeypot, setHoneypot, handleSubmit };
};
