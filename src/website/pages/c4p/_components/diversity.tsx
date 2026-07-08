import type { SubmitEvent } from 'react';
import type { FormData } from '../../../contexts/c4p';
import Link from '@docusaurus/Link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
import { useLocalePath } from '@site/src/website/hooks/useLocalePath';
import * as styles from '../_styles';
import {
  disabilityOptions,
  genderOptions,
  raceOptions,
  toBadge,
  useC4P,
} from '../../../contexts/c4p';

export const Diversity = () => {
  const { localePath } = useLocalePath();
  const { formData, updateField, goToStep } = useC4P();

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();

    if (!formData.gender) updateField('gender', genderOptions.at(-1)!.value);
    if (!formData.race) updateField('race', raceOptions.at(-1)!.value);
    if (!formData.disability)
      updateField('disability', disabilityOptions.at(-1)!.value);

    goToStep(4);
  };

  const handleRadioChange = (field: keyof FormData, value: string) => () =>
    updateField(field, value);

  const handleBack = () => goToStep(2);

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-[0.8rem]'>
      <section className={styles.section}>
        <p className={styles.paragraph}>
          <Text id='c4p.div.intro' />
        </p>
        <div className='flex flex-col gap-[1.2rem] rounded-[1rem] border border-primary/[0.06] bg-primary/[0.02] !px-[2rem] !py-[1.6rem]'>
          <p className={styles.fieldDescription}>
            <Text
              id='c4p.div.sensitive'
              values={{
                link: (
                  <Link
                    to={localePath('/team')}
                    className='text-primary underline'
                  >
                    <Text id='c4p.div.volunteers' />
                  </Link>
                ),
              }}
            />
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            <Text id='c4p.div.gender' />
          </h3>
          <div className={styles.radioGroup}>
            {genderOptions.map((option, index) => (
              <label
                key={option.value}
                className={styles.radioOption(formData.gender === option.value)}
              >
                <span
                  className={styles.badge(formData.gender === option.value)}
                >
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='gender'
                  className={styles.radioHidden}
                  value={option.value}
                  checked={formData.gender === option.value}
                  onChange={handleRadioChange('gender', option.value)}
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
            <Text id='c4p.div.race' />
          </h3>
          <div className={styles.radioGroup}>
            {raceOptions.map((option, index) => (
              <label
                key={option.value}
                className={styles.radioOption(formData.race === option.value)}
              >
                <span className={styles.badge(formData.race === option.value)}>
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='race'
                  className={styles.radioHidden}
                  value={option.value}
                  checked={formData.race === option.value}
                  onChange={handleRadioChange('race', option.value)}
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
            <Text id='c4p.div.disability' />
          </h3>
          <div className={styles.radioGroup}>
            {disabilityOptions.map((option, index) => (
              <label
                key={option.value}
                className={styles.radioOption(
                  formData.disability === option.value
                )}
              >
                <span
                  className={styles.badge(formData.disability === option.value)}
                >
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='disability'
                  className={styles.radioHidden}
                  value={option.value}
                  checked={formData.disability === option.value}
                  onChange={handleRadioChange('disability', option.value)}
                />
                <span>
                  <Text id={option.labelId} />
                </span>
              </label>
            ))}
          </div>
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
            <Text id='c4p.action.continue' />
          </span>
          <ArrowRight className={styles.submitIcon} aria-hidden />
        </button>
      </div>
    </form>
  );
};
