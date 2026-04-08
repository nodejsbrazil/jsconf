import { ArrowRight } from 'lucide-react';
import { topics, useC4P } from './context';

export const Introduction = () => {
  const { goToStep } = useC4P();

  return (
    <>
      <section className='section'>
        <h1 className='form-title'>Call4papers - JSConf Brasil 2026</h1>
        <h2 className='section-heading'>
          Quer palestrar na JSConf Brasil deste ano?
        </h2>
        <p>
          Essa é a sua chance de dividir o palco com alguns dos profissionais
          mais incríveis da área de tecnologia! Preencha o nosso Call4papers,
          nossa equipe fará a análise e seleção das propostas enviadas.
        </p>
        <p>
          A <strong>JSConf Brasil</strong> existe para compartilhar
          conhecimento, aproximar a comunidade e fortalecer um evento diverso,
          inclusivo e colaborativo.
        </p>
      </section>

      <section className='section'>
        <h2 className='section-heading'>
          JSConf Brasil - 28 de novembro de 2026
        </h2>
        <p>Aceitaremos inscrições até **/**</p>
        <p>
          O evento acontecerá no dia <strong>28 de novembro de 2026</strong>, na{' '}
          <strong>
            Universidade Municipal de São Caetano do Sul, São Caetano do Sul -
            SP
          </strong>
          . Serão palestras, painéis, atividades interativas, feira de
          expositores e muito mais.
        </p>
      </section>

      <section className='section'>
        <p>
          Esses são alguns dos tópicos que sugerimos (o que tem estrelinha são
          os preferidos):
        </p>
        <ul className='topics'>
          {topics.map((topic) => (
            <li
              key={topic.name}
              className={topic.preferred ? 'preferred' : undefined}
            >
              {topic.name}
            </li>
          ))}
        </ul>
      </section>

      <button
        type='button'
        className='submit-button'
        onClick={() => goToStep(2)}
      >
        <span>Continuar</span>
        <ArrowRight className='icon' aria-hidden />
      </button>
    </>
  );
};
