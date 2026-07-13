import { ArrowRight } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
import * as styles from '../_styles';
import { useC4P } from '../../../contexts/c4p';

export const Success = () => {
  const { updateField, goToStep } = useC4P();

  const handleSubmitAnother = () => {
    updateField('duration', '');
    updateField('talkTitle', '');
    updateField('talkDescription', '');
    updateField('audienceLevel', '');
    updateField('talkReason', '');
    goToStep(4);
  };

  return (
    <>
      <section className={styles.section}>
        <p className={styles.paragraph}>
          <Text
            id='c4p.success.thanks'
            values={{
              brand: (
                <strong className={styles.strong}>JSConf Brasil 2026</strong>
              ),
            }}
          />
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>
          <Text id='c4p.success.heading' />
        </h2>
        <div className='flex flex-col gap-[1.2rem] rounded-[1rem] border border-primary/[0.06] bg-primary/[0.02] !px-[2rem] !py-[1.6rem]'>
          <p className={styles.paragraph}>
            <Text id='c4p.success.p1' />
          </p>
          <p className={styles.paragraph}>
            <Text id='c4p.success.p2' />
          </p>
          <p className={styles.paragraph}>
            <Text id='c4p.success.p3' />
          </p>
          <p className={styles.paragraph}>
            <Text id='c4p.success.p4' />
          </p>
          <p className={styles.paragraph}>
            <Text id='c4p.success.p5' />
          </p>
          <p className={styles.paragraph}>
            <Text id='c4p.success.p6' />
          </p>
        </div>
      </section>

      <button
        type='button'
        className={styles.submitButton}
        onClick={handleSubmitAnother}
      >
        <span>
          <Text id='c4p.action.submitAnother' />
        </span>
        <ArrowRight className={styles.submitIcon} aria-hidden />
      </button>
    </>
  );
};
