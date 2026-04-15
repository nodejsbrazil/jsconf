import { ArrowRight } from 'lucide-react';
import { useC4P } from '../../../contexts/c4p';
import * as styles from '../styles';

export const Success = () => {
  const { updateField, goToStep } = useC4P();

  const handleSubmitAnother = () => {
    updateField('duration', '');
    updateField('talkTitle', '');
    updateField('talkDescription', '');
    updateField('audienceLevel', '');
    updateField('talkReason', '');
    goToStep(4);
  };

  return (
    <>
      <section className={styles.section}>
        <p className={styles.paragraph}>
          Obrigado por se inscrever no Call4Papers da{' '}
          <strong className={styles.strong}>JSConf Brasil 2026</strong>. Sua
          proposta foi recebida com sucesso.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>
          Como os conteúdos serão avaliados?
        </h2>
        <div className='flex flex-col gap-[1.2rem] rounded-[1rem] border border-primary/[0.06] bg-primary/[0.02] !px-[2rem] !py-[1.6rem]'>
          <p className={styles.paragraph}>
            A avaliação das propostas acontecerá em duas etapas.
          </p>
          <p className={styles.paragraph}>
            Primeiro, um grupo de co-curadoria analisará anonimamente o título,
            a descrição e o nível de conhecimento indicado para cada palestra.
          </p>
          <p className={styles.paragraph}>
            Em seguida, a equipe da JSConf Brasil fará uma análise complementar
            para verificar o encaixe do conteúdo na programação, considerando
            orçamento, estratégia e diversidade temática.
          </p>
          <p className={styles.paragraph}>
            Não existe um número fixo de pessoas selecionadas; a escolha
            dependerá da qualidade e adequação das propostas enviadas.
          </p>
          <p className={styles.paragraph}>
            Após o fim das inscrições, todo o processo de avaliação será
            concluído em até duas semanas.
          </p>
          <p className={styles.paragraph}>
            As pessoas selecionadas receberão um e-mail para confirmar sua
            participação e, caso não haja resposta, entraremos em contato com as
            próximas da lista. Assim que todas as confirmações forem
            finalizadas, informaremos também as pessoas que não forem aprovadas.
          </p>
        </div>
      </section>

      <button
        type='button'
        className={styles.submitButton}
        onClick={handleSubmitAnother}
      >
        <span>Enviar outra palestra</span>
        <ArrowRight className={styles.submitIcon} aria-hidden />
      </button>
    </>
  );
};
