import { ArrowRight, CircleCheck } from 'lucide-react';
import { useC4P } from './context';
import * as styles from './styles';

export const Success = () => {
  const { updateField, goToStep } = useC4P();

  return (
    <>
      <section className='flex flex-col items-center justify-center gap-[1.4rem] border-b border-white/[0.06] pb-[2.8rem] mb-[1rem] pt-[2rem] text-center last:border-b-0 last:mb-0'>
        <CircleCheck
          className='mb-[1rem] w-[5rem] h-[5rem] text-primary'
          aria-hidden
        />
        <h1 className={styles.formTitle}>Proposta enviada!</h1>
        <p className={styles.paragraph}>
          Obrigado por se inscrever no Call4Papers da{' '}
          <strong className={styles.strong}>JSConf Brasil 2026</strong>. Sua
          proposta foi recebida com sucesso.
        </p>
      </section>

      <section className='flex flex-col items-center justify-center gap-[1.4rem] border-b border-white/[0.06] pb-[2.8rem] mb-[1rem] pt-[2rem] text-center last:border-b-0 last:mb-0'>
        <h2 className={styles.sectionHeading}>
          Como os conteúdos serão avaliados?
        </h2>
        <p className={styles.paragraph}>
          A avaliação das propostas acontecerá em duas etapas.
        </p>
        <p className={styles.paragraph}>
          Primeiro, um grupo de co-curadoria analisará anonimamente o título, a
          descrição e o nível de conhecimento indicado para cada palestra.
        </p>
        <p className={styles.paragraph}>
          Em seguida, a equipe da JSConf Brasil fará uma análise complementar
          para verificar o encaixe do conteúdo na programação, considerando
          orçamento, estratégia e diversidade temática.
        </p>
        <p className={styles.paragraph}>
          Não existe um número fixo de pessoas selecionadas; a escolha dependerá
          da qualidade e adequação das propostas enviadas.
        </p>
        <p className={styles.paragraph}>
          Após o fim das inscrições, todo o processo de avaliação será concluído
          em até duas semanas.
        </p>
        <p className={styles.paragraph}>
          As pessoas selecionadas receberão um e-mail para confirmar sua
          participação e, caso não haja resposta, entraremos em contato com as
          próximas da lista. Assim que todas as confirmações forem finalizadas,
          informaremos também as pessoas que não forem aprovadas.
        </p>
      </section>

      <button
        type='button'
        className={styles.submitButtonCentered}
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
        <ArrowRight className={styles.submitIcon} aria-hidden />
      </button>
    </>
  );
};
