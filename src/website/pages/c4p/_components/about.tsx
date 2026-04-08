import { ArrowLeft, ArrowRight } from 'lucide-react';
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
  brazilianStates,
  experienceOptions,
  toBadge,
  travelOptions,
  useC4P,
} from './context';
import { FieldStatus } from './field-status';
import * as styles from './styles';

export const About = () => {
  const { formData, errors, updateField, goToStep, validate, validateField } =
    useC4P();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (validate()) goToStep(3);
      }}
      className='flex flex-col gap-[0.8rem]'
    >
      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Seu nome <FieldStatus field='name' />
          </h3>
          <div className={`${styles.inputWithIcon} group`}>
            <FaUser
              className={styles.inputIcon(!!errors['name'])}
              aria-hidden
            />
            <input
              type='text'
              aria-label='Seu nome'
              aria-required='true'
              className={`${styles.inputWithIconInput(!!formData.name)} ${errors['name'] ? styles.inputError : ''}`}
              value={formData.name}
              onChange={(event) =>
                updateField('name', event.currentTarget.value)
              }
              onBlur={() => validateField('name')}
            />
          </div>
        </div>

        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            E-mail <FieldStatus field='email' />
          </h3>
          <div className={`${styles.inputWithIcon} group`}>
            <FaEnvelope
              className={styles.inputIcon(!!errors['email'])}
              aria-hidden
            />
            <input
              type='text'
              aria-label='E-mail'
              aria-required='true'
              className={`${styles.inputWithIconInput(!!formData.email)} ${errors['email'] ? styles.inputError : ''}`}
              value={formData.email}
              onChange={(event) =>
                updateField('email', event.currentTarget.value)
              }
              onBlur={() => validateField('email')}
            />
          </div>
        </div>

        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Celular <FieldStatus field='phone' />
          </h3>
          <div className={`${styles.inputWithIcon} group`}>
            <FaPhone
              className={styles.inputIcon(!!errors['phone'])}
              aria-hidden
            />
            <input
              type='text'
              aria-label='Celular'
              aria-required='true'
              className={`${styles.inputWithIconInput(!!formData.phone)} ${errors['phone'] ? styles.inputError : ''}`}
              value={formData.phone}
              onChange={(event) =>
                updateField('phone', event.currentTarget.value)
              }
              onBlur={() => validateField('phone')}
            />
          </div>
        </div>

        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Cidade <FieldStatus field='city' />
          </h3>
          <div className={`${styles.inputWithIcon} group`}>
            <FaLocationDot
              className={styles.inputIcon(!!errors['city'])}
              aria-hidden
            />
            <input
              type='text'
              aria-label='Cidade'
              aria-required='true'
              className={`${styles.inputWithIconInput(!!formData.city)} ${errors['city'] ? styles.inputError : ''}`}
              value={formData.city}
              onChange={(event) =>
                updateField('city', event.currentTarget.value)
              }
              onBlur={() => validateField('city')}
            />
          </div>
        </div>

        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            UF <FieldStatus field='state' />
          </h3>
          <select
            aria-label='UF'
            aria-required='true'
            className={`${styles.selectInput(!!formData.state)} w-[10rem] ${errors['state'] ? styles.inputError : ''}`}
            value={formData.state}
            onChange={(event) => {
              updateField('state', event.currentTarget.value);
              validateField('state');
            }}
            onBlur={() => validateField('state')}
          >
            <option value='' />
            {brazilianStates.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.field}>
          <h3 className={styles.fieldLabel}>
            Sobre a viagem e hospedagem <FieldStatus field='travelPreference' />
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
                key={option.value}
                className={styles.radioOption(
                  formData.travelPreference === option.value
                )}
              >
                <span
                  className={styles.badge(
                    formData.travelPreference === option.value
                  )}
                >
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='travelPreference'
                  className={styles.radioHidden}
                  value={option.value}
                  checked={formData.travelPreference === option.value}
                  onChange={() => {
                    updateField('travelPreference', option.value);
                    validateField('travelPreference');
                  }}
                />
                <span>{option.label}</span>
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
            <FaLinkedinIn className={styles.inputIcon()} aria-hidden />
            <input
              type='text'
              aria-label='LinkedIn'
              className={styles.inputWithIconInput(!!formData.linkedin)}
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
            <FaInstagram className={styles.inputIcon()} aria-hidden />
            <input
              type='text'
              aria-label='Instagram'
              className={styles.inputWithIconInput(!!formData.instagram)}
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
            <FaYoutube className={styles.inputIcon()} aria-hidden />
            <input
              type='text'
              aria-label='YouTube'
              className={styles.inputWithIconInput(!!formData.youtube)}
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
            <FaGithub className={styles.inputIcon()} aria-hidden />
            <input
              type='text'
              aria-label='GitHub'
              className={styles.inputWithIconInput(!!formData.github)}
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
            <FaLink className={styles.inputIcon()} aria-hidden />
            <input
              type='text'
              aria-label='Site Pessoal'
              className={styles.inputWithIconInput(!!formData.website)}
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
            Tempo de experiência <FieldStatus field='experienceLevel' />
          </h3>
          <div className={styles.radioGroup}>
            {experienceOptions.map((option, index) => (
              <label
                key={option.value}
                className={styles.radioOption(
                  formData.experienceLevel === option.value
                )}
              >
                <span
                  className={styles.badge(
                    formData.experienceLevel === option.value
                  )}
                >
                  {toBadge(index)}
                </span>
                <input
                  type='radio'
                  name='experienceLevel'
                  className={styles.radioHidden}
                  value={option.value}
                  checked={formData.experienceLevel === option.value}
                  onChange={() => {
                    updateField('experienceLevel', option.value);
                    validateField('experienceLevel');
                  }}
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
            Mini biografia <FieldStatus field='bio' />
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
            className={`${styles.textarea(!!formData.bio)} ${errors['bio'] ? styles.inputError : ''}`}
            value={formData.bio}
            onChange={(event) => updateField('bio', event.currentTarget.value)}
            onBlur={() => validateField('bio')}
          />
        </div>
      </section>

      <div className='mt-[1rem] flex items-center justify-between'>
        <button
          type='button'
          className={styles.backButton}
          onClick={() => goToStep(1)}
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
