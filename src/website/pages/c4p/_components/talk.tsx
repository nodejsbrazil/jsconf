import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FieldStatus } from './field-status';
import { FaHeading } from 'react-icons/fa6';
import { audienceLevels, durationOptions, toBadge, useC4P } from './context';
import * as styles from './styles';

export const Talk = () => {
  const { formData, errors, updateField, goToStep, validate, validateField } =
    useC4P();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (validate()) {
          console.log(formData);
          goToStep(5);
        }
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
            Tempo de duração <FieldStatus field='duration' />
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
            Para quem é este conteúdo?{' '}
            <FieldStatus field='audienceLevel' />
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
            <FieldStatus field='talkReason' />
          </h3>
          <textarea
            aria-label='Por que deveríamos considerar este conteúdo na JSConf Brasil?'
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
