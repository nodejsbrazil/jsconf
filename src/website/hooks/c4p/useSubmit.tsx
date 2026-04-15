import type { SubmitEvent } from 'react';
import { useRef, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { toast } from 'sonner';
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
      toast.error('Configuração indisponível. Tente novamente mais tarde.');
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
            ? 'Você já atingiu o limite de 3 palestras.'
            : 'Erro ao enviar proposta. Tente novamente.';
        toast.error(message);
        return;
      }

      goToStep(5);
    } catch {
      toast.error('Erro ao enviar proposta. Tente novamente.');
    } finally {
      submitting.current = false;
    }
  };

  return { honeypot, setHoneypot, handleSubmit };
};
