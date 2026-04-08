import { ArrowRight } from 'lucide-react';
import { topics, useC4P } from './context';
import * as styles from './styles';

export const Introduction = () => {
  const { goToStep } = useC4P();

  return (
    <>
      <section className={styles.section}>
        <h1 className={styles.formTitle}>Call4Papers - JSConf Brasil 2026</h1>
        <h2 className={styles.sectionHeading}>
          Quer palestrar na JSConf Brasil deste ano?
        </h2>
        <p className={styles.paragraph}>
          Essa é a sua chance de dividir o palco com alguns dos profissionais
          mais incríveis da área de tecnologia! Preencha o nosso Call4Papers,
          nossa equipe fará a análise e seleção das propostas enviadas.
        </p>
        <p className={styles.paragraph}>
          A <strong className={styles.strong}>JSConf Brasil</strong> existe para
          compartilhar conhecimento, aproximar a comunidade e fortalecer um
          evento diverso, inclusivo e colaborativo.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>
          JSConf Brasil - 28 de novembro de 2026
        </h2>
        <p className={styles.paragraph}>Aceitaremos inscrições até **/**</p>
        <p className={styles.paragraph}>
          O evento acontecerá no dia{' '}
          <strong className={styles.strong}>28 de novembro de 2026</strong>, na{' '}
          <strong className={styles.strong}>
            Universidade Municipal de São Caetano do Sul, São Caetano do Sul -
            SP
          </strong>
          . Serão palestras, painéis, atividades interativas, feira de
          expositores e muito mais.
        </p>
      </section>

      <section className={styles.section}>
        <p className={styles.paragraph}>
          Esses são alguns dos tópicos que sugerimos (o que tem estrelinha são
          os preferidos):
        </p>
        <ul className='!my-[0.4rem] grid list-none grid-cols-2 gap-x-[2rem] gap-y-[0.4rem] rounded-[1rem] border border-primary/[0.06] bg-primary/[0.02] !px-[2rem] !py-[1.6rem] max-md:grid-cols-1'>
          {topics.map((topic) => (
            <li
              key={topic.name}
              className={`relative py-[0.6rem] pl-[1.8rem] text-[1.4rem] before:absolute before:left-0 ${
                topic.preferred
                  ? 'font-bold text-white before:content-["★"] before:text-primary'
                  : 'text-white/60 before:content-["•"] before:text-white/30'
              }`}
            >
              {topic.name}
            </li>
          ))}
        </ul>
      </section>

      <button
        type='button'
        className={styles.submitButton}
        onClick={() => goToStep(2)}
      >
        <span>Continuar</span>
        <ArrowRight className={styles.submitIcon} aria-hidden />
      </button>
    </>
  );
};
