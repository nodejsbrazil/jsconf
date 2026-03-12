import '@site/src/website/scss/pages/markdown.scss';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { text } from '@site/src/website/components/shared/i18n';
import CoC_enUS from '../assets/md/CoC.en-US.md';
import CoC_es419 from '../assets/md/CoC.es-419.md';
import CoC_ptBR from '../assets/md/CoC.md';
import { Page } from '../components/shared/Page';

const selectCoC = (locale: string) => {
  switch (locale) {
    case 'en-US':
      return CoC_enUS;
    case 'es-419':
      return CoC_es419;
    case 'pt-BR':
      return CoC_ptBR;
    default:
      return CoC_ptBR;
  }
};

export default () => {
  const {
    i18n: { currentLocale },
  } = useDocusaurusContext();
  const CoC = selectCoC(currentLocale);

  return (
    <Page
      title={text({ id: 'coc.pageTitle' })}
      description={text({ id: 'coc.pageDescription' })}
    >
      <article className='page-content markdown'>
        <CoC />
      </article>
    </Page>
  );
};
