import '@site/src/scss/pages/markdown.scss';
import { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CoC_enUS from '../assets/md/CoC.en-US.md';
import CoC_ptBR from '../assets/md/CoC.md';
import { Page } from '../components/shared/Page';

export default () => {
  const {
    i18n: { currentLocale },
  } = useDocusaurusContext();
  const CoC = currentLocale === 'en-US' ? CoC_enUS : CoC_ptBR;

  return (
    <Page
      title={translate({ id: 'coc.pageTitle', message: 'Código de Conduta' })}
      description={translate({
        id: 'coc.pageDescription',
        message: 'Código de Conduta da JSConf Brasil',
      })}
    >
      <article className='page-content markdown'>
        <CoC />
      </article>
    </Page>
  );
};
