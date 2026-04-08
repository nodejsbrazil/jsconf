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

export const About = () => {
  const { formData, updateField, goToStep } = useC4P();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        goToStep(3);
      }}
    >
      <section className='section'>
        <h2 className='section-heading'>Sobre você</h2>
      </section>

      <section className='section'>
        <div className='field'>
          <h3 className='field-label'>
            Seu nome <span className='required'>*</span>
          </h3>
          <div className='input-with-icon'>
            <FaUser className='input-icon' aria-hidden />
            <input
              type='text'
              aria-label='Seu nome'
              aria-required='true'
              value={formData.name}
              onChange={(event) =>
                updateField('name', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className='field'>
          <h3 className='field-label'>
            E-mail <span className='required'>*</span>
          </h3>
          <div className='input-with-icon'>
            <FaEnvelope className='input-icon' aria-hidden />
            <input
              type='text'
              aria-label='E-mail'
              aria-required='true'
              value={formData.email}
              onChange={(event) =>
                updateField('email', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className='field'>
          <h3 className='field-label'>
            Celular <span className='required'>*</span>
          </h3>
          <div className='input-with-icon'>
            <FaPhone className='input-icon' aria-hidden />
            <input
              type='text'
              aria-label='Celular'
              aria-required='true'
              value={formData.phone}
              onChange={(event) =>
                updateField('phone', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className='field'>
          <h3 className='field-label'>
            Cidade/UF <span className='required'>*</span>
          </h3>
          <div className='input-with-icon'>
            <FaLocationDot className='input-icon' aria-hidden />
            <input
              type='text'
              aria-label='Cidade/UF'
              aria-required='true'
              value={formData.cityState}
              onChange={(event) =>
                updateField('cityState', event.currentTarget.value)
              }
            />
          </div>
        </div>
      </section>

      <section className='section'>
        <div className='field'>
          <h3 className='field-label'>
            Sobre a viagem e hospedagem <span className='required'>*</span>
          </h3>
          <p className='field-description'>
            A cidade onde você mora pode influenciar na seleção, pois o
            deslocamento pode gerar custos adicionais para o evento. Dependendo
            do nosso orçamento, talvez não seja possível custear passagem e
            hospedagem para todos os palestrantes.
          </p>
          <div className='radio-group'>
            {travelOptions.map((option, index) => (
              <label
                key={option}
                className={`radio-option ${formData.travelPreference === option ? 'selected' : ''}`}
              >
                <span className='badge'>{toBadge(index)}</span>
                <input
                  type='radio'
                  name='travelPreference'
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

      <section className='section'>
        <h3 className='field-label'>Redes sociais</h3>

        <div className='field'>
          <label className='sub-label'>LinkedIn</label>
          <div className='input-with-icon'>
            <FaLinkedinIn className='input-icon' aria-hidden />
            <input
              type='text'
              aria-label='LinkedIn'
              value={formData.linkedin}
              onChange={(event) =>
                updateField('linkedin', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className='field'>
          <label className='sub-label'>Instagram</label>
          <div className='input-with-icon'>
            <FaInstagram className='input-icon' aria-hidden />
            <input
              type='text'
              aria-label='Instagram'
              value={formData.instagram}
              onChange={(event) =>
                updateField('instagram', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className='field'>
          <label className='sub-label'>YouTube</label>
          <div className='input-with-icon'>
            <FaYoutube className='input-icon' aria-hidden />
            <input
              type='text'
              aria-label='YouTube'
              value={formData.youtube}
              onChange={(event) =>
                updateField('youtube', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className='field'>
          <label className='sub-label'>GitHub</label>
          <div className='input-with-icon'>
            <FaGithub className='input-icon' aria-hidden />
            <input
              type='text'
              aria-label='GitHub'
              value={formData.github}
              onChange={(event) =>
                updateField('github', event.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className='field'>
          <label className='sub-label'>Site Pessoal</label>
          <div className='input-with-icon'>
            <FaLink className='input-icon' aria-hidden />
            <input
              type='text'
              aria-label='Site Pessoal'
              value={formData.website}
              onChange={(event) =>
                updateField('website', event.currentTarget.value)
              }
            />
          </div>
        </div>
      </section>

      <section className='section'>
        <div className='field'>
          <h3 className='field-label'>
            Tempo de experiência <span className='required'>*</span>
          </h3>
          <div className='radio-group'>
            {experienceOptions.map((option, index) => (
              <label
                key={option}
                className={`radio-option ${formData.experienceLevel === option ? 'selected' : ''}`}
              >
                <span className='badge'>{toBadge(index)}</span>
                <input
                  type='radio'
                  name='experienceLevel'
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

      <section className='section'>
        <div className='field'>
          <h3 className='field-label'>
            Mini biografia <span className='required'>*</span>
          </h3>
          <p className='field-description'>
            Em um único parágrafo, com até 280 caracteres, inclua informações
            sobre sua formação, certificações, cargo atual e anteriores,
            pesquisas desenvolvidas, artigos publicados ou qualquer outro dado
            profissional que considere relevante.
          </p>
          <textarea
            aria-label='Mini biografia'
            aria-required='true'
            maxLength={280}
            value={formData.bio}
            onChange={(event) => updateField('bio', event.currentTarget.value)}
          />
        </div>
      </section>

      <section className='section'>
        <div className='field'>
          <h3 className='field-label'>
            A JSConf Brasil busca sempre pela diversidade, inclusão e
            acessibilidade. Caso se sinta confortável em responder, gostaríamos
            de saber: <span className='required'>*</span>
          </h3>

          <p className='checkbox-group-label'>Identidade de Gênero</p>
          <div className='radio-group'>
            {genderOptions.map((option, index) => (
              <label
                key={option}
                className={`radio-option ${formData.gender === option ? 'selected' : ''}`}
              >
                <span className='badge'>{toBadge(index)}</span>
                <input
                  type='radio'
                  name='gender'
                  value={option}
                  checked={formData.gender === option}
                  onChange={() => updateField('gender', option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <p className='checkbox-group-label'>
            Qual cor/raça você se identifica?
          </p>
          <div className='radio-group'>
            {raceOptions.map((option, index) => (
              <label
                key={option}
                className={`radio-option ${formData.race === option ? 'selected' : ''}`}
              >
                <span className='badge'>{toBadge(index)}</span>
                <input
                  type='radio'
                  name='race'
                  value={option}
                  checked={formData.race === option}
                  onChange={() => updateField('race', option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <p className='checkbox-group-label'>
            Situação de deficiência: qual das opções abaixo descreve você, se
            tiver alguma?
          </p>
          <div className='radio-group'>
            {disabilityOptions.map((option, index) => (
              <label
                key={option}
                className={`radio-option ${formData.disability === option ? 'selected' : ''}`}
              >
                <span className='badge'>{toBadge(index)}</span>
                <input
                  type='radio'
                  name='disability'
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

      <button type='submit' className='submit-button'>
        <span>Continuar</span>
        <ArrowRight className='icon' aria-hidden />
      </button>
    </form>
  );
};
