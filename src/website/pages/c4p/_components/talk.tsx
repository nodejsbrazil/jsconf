import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FaHeading } from 'react-icons/fa6';
import { audienceLevels, durationOptions, toBadge, useC4P } from './context';
import * as styles from './styles';

export const Talk = () => {
  const { formData, updateField, goToStep } = useC4P();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        console.log(formData);
        goToStep(5);
      }}
      className='flex flex-col gap-[0.8rem]'
    >
      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>Tipo de conteúdo</h3>
          <p className={styles.fieldDescription}>
            O formato dos conteúdos será em palestras de 20 ou 40 minutos.
            Escolha o tempo de duração que você considera mais adequado para a
            sua proposta.
          </p>
        </div>

        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Tempo de duração <span className={styles.required}>*</span>
          </h3>
          <div className={styles.radioGroup}>
            {durationOptions.map((option, index) => (
              <label
                key={option}
                className={styles.radioOption(formData.duration === option)}
              >
                <span className={styles.badge(formData.duration === option)}>
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='duration'
                  className={styles.radioHidden}
                  value={option}
                  checked={formData.duration === option}
                  onChange={() => updateField('duration', option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Título <span className={styles.required}>*</span>
          </h3>
          <div className={`${styles.inputWithIcon} group`}>
            <FaHeading
              className={`${styles.inputIcon} group-focus-within:text-primary`}
              aria-hidden
            />
            <input
              type='text'
              aria-label='Título'
              aria-required='true'
              className={styles.inputWithIconInput(!!formData.talkTitle)}
              value={formData.talkTitle}
              onChange={(event) =>
                updateField('talkTitle', event.currentTarget.value)
              }
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Descrição <span className={styles.required}>*</span>
          </h3>
          <p className={styles.fieldDescription}>
            Forneça um resumo do seu conteúdo. Essa informação será usada em
            nosso site para divulgação da sua palestra.
          </p>
          <textarea
            aria-label='Descrição'
            aria-required='true'
            className={styles.textarea(!!formData.talkDescription)}
            value={formData.talkDescription}
            onChange={(event) =>
              updateField('talkDescription', event.currentTarget.value)
            }
          />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Para quem é este conteúdo?{' '}
            <span className={styles.required}>*</span>
          </h3>
          <div className={styles.radioGroup}>
            {audienceLevels.map((option, index) => (
              <label
                key={option}
                className={styles.radioOption(
                  formData.audienceLevel === option
                )}
              >
                <span
                  className={styles.badge(formData.audienceLevel === option)}
                >
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='audienceLevel'
                  className={styles.radioHidden}
                  value={option}
                  checked={formData.audienceLevel === option}
                  onChange={() => updateField('audienceLevel', option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Por que deveríamos considerar este conteúdo na JSConf Brasil?{' '}
            <span className={styles.required}>*</span>
          </h3>
          <textarea
            aria-label='Por que deveríamos considerar este conteúdo na JSConf Brasil?'
            aria-required='true'
            className={styles.textarea(!!formData.talkReason)}
            value={formData.talkReason}
            onChange={(event) =>
              updateField('talkReason', event.currentTarget.value)
            }
          />
        </div>
      </section>

      <div className='flex items-center justify-between mt-[1rem]'>
        <button
          type='button'
          className={styles.backButton}
          onClick={() => goToStep(3)}
        >
          <ArrowLeft className='w-[1.6rem] h-[1.6rem]' aria-hidden />
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
