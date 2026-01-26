import '@site/src/scss/pages/root.scss';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import { Benefits } from '../components/home/Benefits';
import { Home } from '../components/home/Home';
import { Speakers } from '../components/home/Speakers';
import { Team } from '../components/home/Team';

export default () => (
  <Layout title='JSConf Brasil 2026'>
    <Head>
      <meta name='theme-color' content='#000c05' />
    </Head>
    <div id='root'>
      <Home />
      <Benefits />
      <Speakers />
      <Team />
    </div>
  </Layout>
);
