import '@site/src/scss/pages/markdown.scss';
import CoC from '../assets/md/CoC.md';
import { Page } from '../components/shared/Page';

export default () => (
  <Page
    title='Código de Condulta'
    description='Código de Conduta da JSConf Brasil'
  >
    <article className='page-content markdown'>
      <CoC />
    </article>
  </Page>
);
