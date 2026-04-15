import type { ChangeEvent, SubmitEvent } from 'react';
import type { FormData } from '../../../contexts/c4p';
import { useRef, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FaHeading } from 'react-icons/fa6';
import { toast } from 'sonner';
import * as styles from '../_styles';
import {
  audienceLevels,
  durationOptions,
  toBadge,
  useC4P,
} from '../../../contexts/c4p';
import { FieldStatus } from './field-status';

export const Talk = () => {
  const { siteConfig } = useDocusaurusContext();
  const workerDomain = siteConfig.customFields?.['workerDomain'];
  const { formData, errors, updateField, goToStep, validate, validateField } =
    useC4P();
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

  const handleHoneypotChange = (event: ChangeEvent<HTMLInputElement>) =>
    setHoneypot(event.currentTarget.value);

  const handleChange =
    (field: keyof FormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      updateField(field, event.currentTarget.value);

  const handleBlur = (field: keyof FormData) => () => validateField(field);

  const handleRadioChange = (field: keyof FormData, value: string) => () => {
    updateField(field, value);
    validateField(field);
  };

  const handleBack = () => goToStep(3);

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-[0.8rem]'>
      {/* Bot Honeypot */}
      <input
        type='text'
        name='confirm_email'
        className='c4p-confirm'
        value={honeypot}
        onChange={handleHoneypotChange}
        tabIndex={-1}
        autoComplete='off'
        aria-hidden='true'
      />
      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>Tipo de conteúdo</h3>
          <p className={styles.fieldDescription}>
            O formato dos conteúdos será em palestras de 15 ou 25 minutos.
            Escolha o tempo de duração que você considera mais adequado para a
            sua proposta.
          </p>
        </div>

        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Tempo de duração <FieldStatus field='duration' />
          </h3>
          <div className={styles.radioGroup}>
            {durationOptions.map((option, index) => (
              <label
                key={option.value}
                className={styles.radioOption(
                  formData.duration === option.value
                )}
              >
                <span
                  className={styles.badge(formData.duration === option.value)}
                >
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='duration'
                  className={styles.radioHidden}
                  value={option.value}
                  checked={formData.duration === option.value}
                  onChange={handleRadioChange('duration', option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Título <FieldStatus field='talkTitle' />
          </h3>
          <div className={`${styles.inputWithIcon} group`}>
            <FaHeading
              className={styles.inputIcon(!!errors['talkTitle'])}
              aria-hidden
            />
            <input
              type='text'
              aria-label='Título'
              aria-required='true'
              className={`${styles.inputWithIconInput(!!formData.talkTitle)} ${errors['talkTitle'] ? styles.inputError : ''}`}
              value={formData.talkTitle}
              onChange={handleChange('talkTitle')}
              onBlur={handleBlur('talkTitle')}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Descrição <FieldStatus field='talkDescription' />
          </h3>
          <p className={styles.fieldDescription}>
            Forneça um resumo do seu conteúdo. Essa informação será usada em
            nosso site para divulgação da sua palestra.
          </p>
          <textarea
            aria-label='Descrição'
            aria-required='true'
            className={`${styles.textarea(!!formData.talkDescription)} ${errors['talkDescription'] ? styles.inputError : ''}`}
            value={formData.talkDescription}
            onChange={handleChange('talkDescription')}
            onBlur={handleBlur('talkDescription')}
          />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Para quem é este conteúdo? <FieldStatus field='audienceLevel' />
          </h3>
          <div className={styles.radioGroup}>
            {audienceLevels.map((option, index) => (
              <label
                key={option.value}
                className={styles.radioOption(
                  formData.audienceLevel === option.value
                )}
              >
                <span
                  className={styles.badge(
                    formData.audienceLevel === option.value
                  )}
                >
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='audienceLevel'
                  className={styles.radioHidden}
                  value={option.value}
                  checked={formData.audienceLevel === option.value}
                  onChange={handleRadioChange('audienceLevel', option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Por que deveríamos considerar este conteúdo na JSConf Brasil?{' '}
            <FieldStatus field='talkReason' />
          </h3>
          <textarea
            aria-label='Por que deveríamos considerar este conteúdo na JSConf Brasil?'
            aria-required='true'
            className={`${styles.textarea(!!formData.talkReason)} ${errors['talkReason'] ? styles.inputError : ''}`}
            value={formData.talkReason}
            onChange={handleChange('talkReason')}
            onBlur={handleBlur('talkReason')}
          />
        </div>
      </section>

      <div className='mt-[1rem] flex items-center justify-between'>
        <button
          type='button'
          className={styles.backButton}
          onClick={handleBack}
        >
          <ArrowLeft className='h-[1.6rem] w-[1.6rem]' aria-hidden />
          <span>Voltar</span>
        </button>
        <button type='submit' className={styles.submitButton}>
          <span>Finalizar</span>
          <ArrowRight className={styles.submitIcon} aria-hidden />
        </button>
      </div>
    </form>
  );
};
