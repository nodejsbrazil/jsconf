import type { ChangeEvent, SubmitEvent } from 'react';
import type { FormData } from '../../../contexts/c4p';
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
import * as styles from '../_styles';
import {
  brazilianStates,
  experienceOptions,
  toBadge,
  travelOptions,
  useC4P,
} from '../../../contexts/c4p';
import { FieldStatus } from './field-status';

export const About = () => {
  const { formData, errors, updateField, goToStep, validate, validateField } =
    useC4P();

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) goToStep(3);
  };

  const handleChange =
    (field: keyof FormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      updateField(field, event.currentTarget.value);

  const handleBlur = (field: keyof FormData) => () => validateField(field);

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateField('state', event.currentTarget.value);
    validateField('state');
  };

  const handleRadioChange = (field: keyof FormData, value: string) => () => {
    updateField(field, value);
    validateField(field);
  };

  const handleBack = () => goToStep(1);

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-[0.8rem]'>
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
              onChange={handleChange('name')}
              onBlur={handleBlur('name')}
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
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
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
              onChange={handleChange('phone')}
              onBlur={handleBlur('phone')}
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
              onChange={handleChange('city')}
              onBlur={handleBlur('city')}
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
            onChange={handleStateChange}
            onBlur={handleBlur('state')}
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
                  onChange={handleRadioChange('travelPreference', option.value)}
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
              onChange={handleChange('linkedin')}
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
              onChange={handleChange('instagram')}
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
              onChange={handleChange('youtube')}
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
              onChange={handleChange('github')}
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
              onChange={handleChange('website')}
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
                  onChange={handleRadioChange('experienceLevel', option.value)}
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
            onChange={handleChange('bio')}
            onBlur={handleBlur('bio')}
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
