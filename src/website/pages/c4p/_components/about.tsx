import { ArrowRight } from 'lucide-react';
import {
  FaEnvelope,
  FaGithub,
  FaInstagram,
  FaLink,
  FaLinkedinIn,
  FaLocationDot,
  FaPhone,
  FaUser,
  FaYoutube,
} from 'react-icons/fa6';
import {
  disabilityOptions,
  experienceOptions,
  genderOptions,
  raceOptions,
  toBadge,
  travelOptions,
  useC4P,
} from './context';
import * as styles from './styles';

export const About = () => {
  const { formData, updateField, goToStep } = useC4P();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        goToStep(3);
      }}
      className='flex flex-col gap-[0.8rem]'
    >
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Sobre você</h2>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Seu nome <span className={styles.required}>*</span>
          </h3>
          <div className={`${styles.inputWithIcon} group`}>
            <FaUser
              className={`${styles.inputIcon} group-focus-within:text-primary`}
              aria-hidden
            />
            <input
              type='text'
              aria-label='Seu nome'
              aria-required='true'
              className={styles.inputWithIconInput}
              value={formData.name}
              onChange={(event) =>
                updateField('name', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            E-mail <span className={styles.required}>*</span>
          </h3>
          <div className={`${styles.inputWithIcon} group`}>
            <FaEnvelope
              className={`${styles.inputIcon} group-focus-within:text-primary`}
              aria-hidden
            />
            <input
              type='text'
              aria-label='E-mail'
              aria-required='true'
              className={styles.inputWithIconInput}
              value={formData.email}
              onChange={(event) =>
                updateField('email', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Celular <span className={styles.required}>*</span>
          </h3>
          <div className={`${styles.inputWithIcon} group`}>
            <FaPhone
              className={`${styles.inputIcon} group-focus-within:text-primary`}
              aria-hidden
            />
            <input
              type='text'
              aria-label='Celular'
              aria-required='true'
              className={styles.inputWithIconInput}
              value={formData.phone}
              onChange={(event) =>
                updateField('phone', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Cidade/UF <span className={styles.required}>*</span>
          </h3>
          <div className={`${styles.inputWithIcon} group`}>
            <FaLocationDot
              className={`${styles.inputIcon} group-focus-within:text-primary`}
              aria-hidden
            />
            <input
              type='text'
              aria-label='Cidade/UF'
              aria-required='true'
              className={styles.inputWithIconInput}
              value={formData.cityState}
              onChange={(event) =>
                updateField('cityState', event.currentTarget.value)
              }
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Sobre a viagem e hospedagem{' '}
            <span className={styles.required}>*</span>
          </h3>
          <p className={styles.fieldDescription}>
            A cidade onde você mora pode influenciar na seleção, pois o
            deslocamento pode gerar custos adicionais para o evento. Dependendo
            do nosso orçamento, talvez não seja possível custear passagem e
            hospedagem para todos os palestrantes.
          </p>
          <div className={styles.radioGroup}>
            {travelOptions.map((option, index) => (
              <label
                key={option}
                className={styles.radioOption(
                  formData.travelPreference === option
                )}
              >
                <span
                  className={styles.badge(formData.travelPreference === option)}
                >
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='travelPreference'
                  className={styles.radioHidden}
                  value={option}
                  checked={formData.travelPreference === option}
                  onChange={() => updateField('travelPreference', option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.fieldLabel}>Redes sociais</h3>

        <div className={styles.field}>
          <label className={styles.subLabel}>LinkedIn</label>
          <div className={`${styles.inputWithIcon} group`}>
            <FaLinkedinIn
              className={`${styles.inputIcon} group-focus-within:text-primary`}
              aria-hidden
            />
            <input
              type='text'
              aria-label='LinkedIn'
              className={styles.inputWithIconInput}
              value={formData.linkedin}
              onChange={(event) =>
                updateField('linkedin', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.subLabel}>Instagram</label>
          <div className={`${styles.inputWithIcon} group`}>
            <FaInstagram
              className={`${styles.inputIcon} group-focus-within:text-primary`}
              aria-hidden
            />
            <input
              type='text'
              aria-label='Instagram'
              className={styles.inputWithIconInput}
              value={formData.instagram}
              onChange={(event) =>
                updateField('instagram', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.subLabel}>YouTube</label>
          <div className={`${styles.inputWithIcon} group`}>
            <FaYoutube
              className={`${styles.inputIcon} group-focus-within:text-primary`}
              aria-hidden
            />
            <input
              type='text'
              aria-label='YouTube'
              className={styles.inputWithIconInput}
              value={formData.youtube}
              onChange={(event) =>
                updateField('youtube', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.subLabel}>GitHub</label>
          <div className={`${styles.inputWithIcon} group`}>
            <FaGithub
              className={`${styles.inputIcon} group-focus-within:text-primary`}
              aria-hidden
            />
            <input
              type='text'
              aria-label='GitHub'
              className={styles.inputWithIconInput}
              value={formData.github}
              onChange={(event) =>
                updateField('github', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.subLabel}>Site Pessoal</label>
          <div className={`${styles.inputWithIcon} group`}>
            <FaLink
              className={`${styles.inputIcon} group-focus-within:text-primary`}
              aria-hidden
            />
            <input
              type='text'
              aria-label='Site Pessoal'
              className={styles.inputWithIconInput}
              value={formData.website}
              onChange={(event) =>
                updateField('website', event.currentTarget.value)
              }
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Tempo de experiência <span className={styles.required}>*</span>
          </h3>
          <div className={styles.radioGroup}>
            {experienceOptions.map((option, index) => (
              <label
                key={option}
                className={styles.radioOption(
                  formData.experienceLevel === option
                )}
              >
                <span
                  className={styles.badge(formData.experienceLevel === option)}
                >
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='experienceLevel'
                  className={styles.radioHidden}
                  value={option}
                  checked={formData.experienceLevel === option}
                  onChange={() => updateField('experienceLevel', option)}
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
            Mini biografia <span className={styles.required}>*</span>
          </h3>
          <p className={styles.fieldDescription}>
            Em um único parágrafo, com até 280 caracteres, inclua informações
            sobre sua formação, certificações, cargo atual e anteriores,
            pesquisas desenvolvidas, artigos publicados ou qualquer outro dado
            profissional que considere relevante.
          </p>
          <textarea
            aria-label='Mini biografia'
            aria-required='true'
            maxLength={280}
            className={styles.textarea}
            value={formData.bio}
            onChange={(event) => updateField('bio', event.currentTarget.value)}
          />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            A JSConf Brasil busca sempre pela diversidade, inclusão e
            acessibilidade. Caso se sinta confortável em responder, gostaríamos
            de saber: <span className={styles.required}>*</span>
          </h3>

          <p className={styles.checkboxGroupLabel}>Identidade de Gênero</p>
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

          <p className={styles.checkboxGroupLabel}>
            Qual cor/raça você se identifica?
          </p>
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

          <p className={styles.checkboxGroupLabel}>
            Situação de deficiência: qual das opções abaixo descreve você, se
            tiver alguma?
          </p>
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

      <button type='submit' className={styles.submitButton}>
        <span>Continuar</span>
        <ArrowRight className={styles.submitIcon} aria-hidden />
      </button>
    </form>
  );
};
