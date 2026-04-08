import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  disabilityOptions,
  genderOptions,
  raceOptions,
  toBadge,
  useC4P,
} from './context';
import * as styles from './styles';

export const Diversity = () => {
  const { formData, updateField, goToStep } = useC4P();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        goToStep(4);
      }}
      className='flex flex-col gap-[0.8rem]'
    >
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Diversidade e inclusão</h2>
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
            escrevendo para um dos voluntários do nosso time.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>Identidade de Gênero</h3>
          <div className={styles.radioGroup}>
            {genderOptions.map((option, index) => (
              <label
                key={option}
                className={styles.radioOption(formData.gender === option)}
              >
                <span className={styles.badge(formData.gender === option)}>
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='gender'
                  className={styles.radioHidden}
                  value={option}
                  checked={formData.gender === option}
                  onChange={() => updateField('gender', option)}
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
            Qual cor/raça você se identifica?
          </h3>
          <div className={styles.radioGroup}>
            {raceOptions.map((option, index) => (
              <label
                key={option}
                className={styles.radioOption(formData.race === option)}
              >
                <span className={styles.badge(formData.race === option)}>
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='race'
                  className={styles.radioHidden}
                  value={option}
                  checked={formData.race === option}
                  onChange={() => updateField('race', option)}
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
            Situação de deficiência: qual das opções abaixo descreve você, se
            tiver alguma?
          </h3>
          <div className={styles.radioGroup}>
            {disabilityOptions.map((option, index) => (
              <label
                key={option}
                className={styles.radioOption(formData.disability === option)}
              >
                <span className={styles.badge(formData.disability === option)}>
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='disability'
                  className={styles.radioHidden}
                  value={option}
                  checked={formData.disability === option}
                  onChange={() => updateField('disability', option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <div className='mt-[1rem] flex items-center justify-between'>
        <button
          type='button'
          className={styles.backButton}
          onClick={() => goToStep(2)}
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
