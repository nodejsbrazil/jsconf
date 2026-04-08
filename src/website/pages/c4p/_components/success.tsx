import { ArrowRight, CircleCheck } from 'lucide-react';
import { useC4P } from './context';

export const Success = () => {
  const { updateField, goToStep } = useC4P();

  return (
    <>
      <section className='section success-header'>
        <CircleCheck className='success-icon' aria-hidden />
        <h1 className='form-title'>Proposta enviada!</h1>
        <p>
          Obrigado por se inscrever no Call4papers da{' '}
          <strong>JSConf Brasil 2026</strong>. Sua proposta foi recebida com
          sucesso.
        </p>
      </section>

      <section className='section success-header'>
        <h2 className='section-heading'>Como os conteúdos serão avaliados?</h2>
        <p>A avaliação das propostas acontecerá em duas etapas.</p>
        <p>
          Primeiro, um grupo de co-curadoria analisará anonimamente o título, a
          descrição e o nível de conhecimento indicado para cada palestra.
        </p>
        <p>
          Em seguida, a equipe da JSConf Brasil fará uma análise complementar
          para verificar o encaixe do conteúdo na programação, considerando
          orçamento, estratégia e diversidade temática.
        </p>
        <p>
          Não existe um número fixo de pessoas selecionadas; a escolha dependerá
          da qualidade e adequação das propostas enviadas.
        </p>
        <p>
          Após o fim das inscrições, todo o processo de avaliação será concluído
          em até duas semanas.
        </p>
        <p>
          As pessoas selecionadas receberão um e-mail para confirmar sua
          participação e, caso não haja resposta, entraremos em contato com as
          próximas da lista. Assim que todas as confirmações forem finalizadas,
          informaremos também as pessoas que não forem aprovadas.
        </p>
      </section>

      <button
        type='button'
        className='submit-button centered'
        onClick={() => {
          updateField('duration', '');
          updateField('talkTitle', '');
          updateField('talkDescription', '');
          updateField('audienceLevel', '');
          updateField('talkReason', '');
          goToStep(3);
        }}
      >
        <span>Enviar outra palestra</span>
        <ArrowRight className='icon' aria-hidden />
      </button>
    </>
  );
};
