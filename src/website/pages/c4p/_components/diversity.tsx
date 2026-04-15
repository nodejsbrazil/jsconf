import type { SubmitEvent } from 'react';
import type { FormData } from '../../../contexts/c4p';
import Link from '@docusaurus/Link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  disabilityOptions,
  genderOptions,
  raceOptions,
  toBadge,
  useC4P,
} from '../../../contexts/c4p';
import * as styles from '../styles';

export const Diversity = () => {
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
          A JSConf Brasil busca sempre pela diversidade, inclusão e
          acessibilidade. Caso se sinta confortável em responder, gostaríamos de
          saber:
        </p>
        <div className='flex flex-col gap-[1.2rem] rounded-[1rem] border border-primary/[0.06] bg-primary/[0.02] !px-[2rem] !py-[1.6rem]'>
          <p className={styles.fieldDescription}>
            Estes dados são sensíveis e opcionais. Serão usados exclusivamente
            para (a) compor um line-up diverso de palestrantes, (b) planejar a
            acessibilidade do evento (intérpretes de Libras, acessibilidade
            física, etc.) e (c) gerar estatísticas agregadas sobre diversidade
            no C4P. Você pode revogar esse consentimento a qualquer momento
            escrevendo para um dos{' '}
            <Link to='/#team' className='text-primary underline'>
              nossos voluntários
            </Link>
            .
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>Identidade de Gênero</h3>
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
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Qual cor/raça você se identifica?
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
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Situação de deficiência: qual das opções abaixo descreve você, se
            tiver alguma?
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
                <span>{option.label}</span>
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
          <span>Voltar</span>
        </button>
        <button type='submit' className={styles.submitButton}>
          <span>Continuar</span>
          <ArrowRight className={styles.submitIcon} aria-hidden />
        </button>
      </div>
    </form>
  );
};
