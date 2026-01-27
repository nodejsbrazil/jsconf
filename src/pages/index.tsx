import '@site/src/scss/pages/root.scss';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import { Benefits } from '../components/home/Benefits';
import { Home } from '../components/home/Home';
import { Speakers } from '../components/home/Speakers';
import { Team } from '../components/home/Team';
import { useBackground } from '../hooks/Background/useBackground';

export default function Index() {
  const { canvasRef } = useBackground({
    intensity: 0.0025,
    zoomSpeed: 0.0005,
    starColor: '#073f294f',
  });

  return (
    <Layout title='JSConf Brasil 2026'>
      <Head>
        <meta name='theme-color' content='#000c05' />
      </Head>
      <div id='root'>
        <canvas ref={canvasRef} className='bg' />
        <Home />
        <Benefits />
        <Speakers />
        <Team />
      </div>
    </Layout>
  );
}
