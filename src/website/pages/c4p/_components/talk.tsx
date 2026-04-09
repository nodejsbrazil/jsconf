import { useRef, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FaHeading } from 'react-icons/fa6';
import { toast } from 'sonner';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { audienceLevels, durationOptions, toBadge, useC4P } from './context';
import { FieldStatus } from './field-status';
import * as styles from './styles';

export const Talk = () => {
  const { siteConfig } = useDocusaurusContext();
  const workerDomain = siteConfig.customFields?.['workerDomain'];
  const { formData, errors, updateField, goToStep, validate, validateField } =
    useC4P();
  const submitting = useRef(false);
  const [honeypot, setHoneypot] = useState('');

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (!validate() || submitting.current) return;

        if (typeof workerDomain !== 'string') {
          toast.error(text({ id: 'c4p.talk.error.configUnavailable' }));
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
                ? text({ id: 'c4p.talk.error.talkLimitExceeded' })
                : text({ id: 'c4p.talk.error.submitFailed' });
            toast.error(message);
            return;
          }

          goToStep(5);
        } catch {
          toast.error(text({ id: 'c4p.talk.error.submitFailed' }));
        } finally {
          submitting.current = false;
        }
      }}
      className='flex flex-col gap-[0.8rem]'
    >
      {/* Bot Honeypot */}
      <input
        type='text'
        name='confirm_email'
        className='c4p-confirm'
        value={honeypot}
        onChange={(event) => setHoneypot(event.currentTarget.value)}
        tabIndex={-1}
        autoComplete='off'
        aria-hidden='true'
      />
      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            <Text id='c4p.talk.contentType.title' />
          </h3>
          <p className={styles.fieldDescription}>
            <Text id='c4p.talk.contentType.description' />
          </p>
        </div>

        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            <Text id='c4p.talk.duration.label' />{' '}
            <FieldStatus field='duration' />
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
                  onChange={() => {
                    updateField('duration', option.value);
                    validateField('duration');
                  }}
                />
                <span>{text({ id: option.labelId })}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            <Text id='c4p.talk.title.label' /> <FieldStatus field='talkTitle' />
          </h3>
          <div className={`${styles.inputWithIcon} group`}>
            <FaHeading
              className={styles.inputIcon(!!errors['talkTitle'])}
              aria-hidden
            />
            <input
              type='text'
              aria-label={text({ id: 'c4p.talk.title.label' })}
              aria-required='true'
              className={`${styles.inputWithIconInput(!!formData.talkTitle)} ${errors['talkTitle'] ? styles.inputError : ''}`}
              value={formData.talkTitle}
              onChange={(event) =>
                updateField('talkTitle', event.currentTarget.value)
              }
              onBlur={() => validateField('talkTitle')}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            <Text id='c4p.talk.description.label' />{' '}
            <FieldStatus field='talkDescription' />
          </h3>
          <p className={styles.fieldDescription}>
            <Text id='c4p.talk.description.hint' />
          </p>
          <textarea
            aria-label={text({ id: 'c4p.talk.description.label' })}
            aria-required='true'
            className={`${styles.textarea(!!formData.talkDescription)} ${errors['talkDescription'] ? styles.inputError : ''}`}
            value={formData.talkDescription}
            onChange={(event) =>
              updateField('talkDescription', event.currentTarget.value)
            }
            onBlur={() => validateField('talkDescription')}
          />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            <Text id='c4p.talk.audience.label' />{' '}
            <FieldStatus field='audienceLevel' />
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
                  onChange={() => {
                    updateField('audienceLevel', option.value);
                    validateField('audienceLevel');
                  }}
                />
                <span>{text({ id: option.labelId })}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            <Text id='c4p.talk.reason.label' />{' '}
            <FieldStatus field='talkReason' />
          </h3>
          <textarea
            aria-label={text({ id: 'c4p.talk.reason.label' })}
            aria-required='true'
            className={`${styles.textarea(!!formData.talkReason)} ${errors['talkReason'] ? styles.inputError : ''}`}
            value={formData.talkReason}
            onChange={(event) =>
              updateField('talkReason', event.currentTarget.value)
            }
            onBlur={() => validateField('talkReason')}
          />
        </div>
      </section>

      <div className='mt-[1rem] flex items-center justify-between'>
        <button
          type='button'
          className={styles.backButton}
          onClick={() => goToStep(3)}
        >
          <ArrowLeft className='h-[1.6rem] w-[1.6rem]' aria-hidden />
          <span>
            <Text id='c4p.talk.back' />
          </span>
        </button>
        <button type='submit' className={styles.submitButton}>
          <span>
            <Text id='c4p.talk.submit' />
          </span>
          <ArrowRight className={styles.submitIcon} aria-hidden />
        </button>
      </div>
    </form>
  );
};
