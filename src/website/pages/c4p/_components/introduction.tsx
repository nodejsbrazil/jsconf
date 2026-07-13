import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Text, text } from '@site/src/website/components/shared/i18n';
import * as styles from '../_styles';
import { topics, useC4P } from '../../../contexts/c4p';

export const Introduction = () => {
  const { goToStep } = useC4P();

  const handleContinue = () => {
    toast.success(text({ id: 'c4p.intro.toastTitle' }), {
      description: text({ id: 'c4p.intro.toastDesc' }),
    });

    goToStep(2);
  };

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>
          <Text id='c4p.intro.heading1' />
        </h2>
        <p className={styles.paragraph}>
          <Text id='c4p.intro.p1' />
        </p>
        <p className={styles.paragraph}>
          <Text
            id='c4p.intro.p2'
            values={{
              brand: <strong className={styles.strong}>JSConf Brasil</strong>,
            }}
          />
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>
          <Text id='c4p.intro.dateHeading' />
        </h2>
        <p className={styles.paragraph}>
          <Text
            id='c4p.intro.deadline'
            values={{
              date: (
                <span className='text-primary !font-bold'>
                  <Text id='c4p.intro.deadlineDate' />
                </span>
              ),
            }}
          />
        </p>
        <p className={styles.paragraph}>
          <Text
            id='c4p.intro.maxTalks'
            values={{
              count: <span className='text-primary !font-bold'>3</span>,
            }}
          />
        </p>
        <p className={styles.paragraph}>
          <Text
            id='c4p.intro.eventInfo'
            values={{
              date: (
                <strong className={styles.strong}>
                  <Text id='c4p.intro.eventDate' />
                </strong>
              ),
              venue: (
                <strong className={styles.strong}>
                  Universidade Municipal de São Caetano do Sul, São Caetano do
                  Sul - SP
                </strong>
              ),
            }}
          />
        </p>
      </section>

      <section className={styles.section}>
        <p className={styles.paragraph}>
          <Text id='c4p.intro.topicsIntro' />
        </p>
        <ul className='!my-[0.4rem] grid list-none grid-cols-2 gap-x-[2rem] gap-y-[0.4rem] rounded-[1rem] border border-primary/[0.06] bg-primary/[0.02] !px-[2rem] !py-[1.6rem] max-md:grid-cols-1'>
          {topics.map((topic) => (
            <li
              key={topic.labelId}
              className={`relative py-[1rem] pl-[2.2rem] text-[1.5rem] leading-[1] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 ${
                topic.preferred
                  ? 'font-bold text-white before:content-["★"] before:text-primary'
                  : 'text-white/60 before:content-["•"] before:text-white/30'
              }`}
            >
              <Text id={topic.labelId} />
            </li>
          ))}
        </ul>
      </section>

      <button
        type='button'
        className={styles.submitButton}
        onClick={handleContinue}
      >
        <span>
          <Text id='c4p.action.continue' />
        </span>
        <ArrowRight className={styles.submitIcon} aria-hidden />
      </button>
    </>
  );
};
