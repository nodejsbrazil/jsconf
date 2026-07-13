import type { ChangeEvent } from 'react';
import type { FormData } from '../../../contexts/c4p';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FaHeading } from 'react-icons/fa6';
import { Text, text } from '@site/src/website/components/shared/i18n';
import * as styles from '../_styles';
import {
  audienceLevels,
  durationOptions,
  toBadge,
  useC4P,
} from '../../../contexts/c4p';
import { useSubmit } from '../../../hooks/c4p/useSubmit';
import { FieldStatus } from './field-status';

export const Talk = () => {
  const { formData, errors, updateField, goToStep, validateField } = useC4P();
  const { honeypot, setHoneypot, handleSubmit } = useSubmit();

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
          <h3 className={styles.fieldLabel}>
            <Text id='c4p.talk.contentType' />
          </h3>
          <p className={styles.fieldDescription}>
            <Text id='c4p.talk.contentTypeDesc' />
          </p>
        </div>

        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            <Text id='c4p.talk.duration' /> <FieldStatus field='duration' />
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
                <span>
                  <Text id={option.labelId} />
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            <Text id='c4p.talk.title' /> <FieldStatus field='talkTitle' />
          </h3>
          <div className={`${styles.inputWithIcon} group`}>
            <FaHeading
              className={styles.inputIcon(!!errors['talkTitle'])}
              aria-hidden
            />
            <input
              type='text'
              aria-label={text({ id: 'c4p.talk.title' })}
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
            <Text id='c4p.talk.description' />{' '}
            <FieldStatus field='talkDescription' />
          </h3>
          <p className={styles.fieldDescription}>
            <Text id='c4p.talk.descriptionDesc' />
          </p>
          <textarea
            aria-label={text({ id: 'c4p.talk.description' })}
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
            <Text id='c4p.talk.audience' />{' '}
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
                  onChange={handleRadioChange('audienceLevel', option.value)}
                />
                <span>
                  <Text id={option.labelId} />
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            <Text id='c4p.talk.reason' /> <FieldStatus field='talkReason' />
          </h3>
          <textarea
            aria-label={text({ id: 'c4p.talk.reason' })}
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
          <span>
            <Text id='c4p.action.back' />
          </span>
        </button>
        <button type='submit' className={styles.submitButton}>
          <span>
            <Text id='c4p.action.finish' />
          </span>
          <ArrowRight className={styles.submitIcon} aria-hidden />
        </button>
      </div>
    </form>
  );
};
