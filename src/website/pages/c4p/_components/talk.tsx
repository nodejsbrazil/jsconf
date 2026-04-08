import { ArrowRight } from 'lucide-react';
import { FaHeading } from 'react-icons/fa6';
import { audienceLevels, durationOptions, toBadge, useC4P } from './context';

export const Talk = () => {
  const { formData, updateField, goToStep } = useC4P();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        console.log(formData);
        goToStep(4);
      }}
    >
      <section className='section'>
        <h1 className='form-title'>Sobre sua participação</h1>
      </section>

      <section className='section'>
        <div className='field'>
          <h3 className='field-label'>Tipo de conteúdo</h3>
          <p className='field-description'>
            O formato dos conteúdos será em palestras de 20 ou 40 minutos.
            Escolha o tempo de duração que você considera mais adequado para a
            sua proposta.
          </p>
        </div>

        <div className='field'>
          <h3 className='field-label'>
            Tempo de duração <span className='required'>*</span>
          </h3>
          <div className='radio-group'>
            {durationOptions.map((option, index) => (
              <label
                key={option}
                className={`radio-option ${formData.duration === option ? 'selected' : ''}`}
              >
                <span className='badge'>{toBadge(index)}</span>
                <input
                  type='radio'
                  name='duration'
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

      <section className='section'>
        <div className='field'>
          <h3 className='field-label'>
            Título <span className='required'>*</span>
          </h3>
          <div className='input-with-icon'>
            <FaHeading className='input-icon' aria-hidden />
            <input
              type='text'
              aria-label='Título'
              aria-required='true'
              value={formData.talkTitle}
              onChange={(event) =>
                updateField('talkTitle', event.currentTarget.value)
              }
            />
          </div>
        </div>
      </section>

      <section className='section'>
        <div className='field'>
          <h3 className='field-label'>
            Descrição <span className='required'>*</span>
          </h3>
          <p className='field-description'>
            Forneça um resumo do seu conteúdo. Essa informação será usada em
            nosso site para divulgação da sua palestra.
          </p>
          <textarea
            aria-label='Descrição'
            aria-required='true'
            value={formData.talkDescription}
            onChange={(event) =>
              updateField('talkDescription', event.currentTarget.value)
            }
          />
        </div>
      </section>

      <section className='section'>
        <div className='field'>
          <h3 className='field-label'>
            Para quem é este conteúdo? <span className='required'>*</span>
          </h3>
          <div className='radio-group'>
            {audienceLevels.map((option, index) => (
              <label
                key={option}
                className={`radio-option ${formData.audienceLevel === option ? 'selected' : ''}`}
              >
                <span className='badge'>{toBadge(index)}</span>
                <input
                  type='radio'
                  name='audienceLevel'
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

      <section className='section'>
        <div className='field'>
          <h3 className='field-label'>
            Por que deveríamos considerar este conteúdo na JSConf Brasil?{' '}
            <span className='required'>*</span>
          </h3>
          <textarea
            aria-label='Por que deveríamos considerar este conteúdo na JSConf Brasil?'
            aria-required='true'
            value={formData.talkReason}
            onChange={(event) =>
              updateField('talkReason', event.currentTarget.value)
            }
          />
        </div>
      </section>

      <button type='submit' className='submit-button'>
        <span>Finalizar</span>
        <ArrowRight className='icon' aria-hidden />
      </button>
    </form>
  );
};
