import '@site/src/scss/pages/root.scss';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import { useBackground } from '../../hooks/Background/useBackground';

type PageProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export const Page = ({ title, description, children }: PageProps) => {
  const { canvasRef } = useBackground({
    intensity: 0.0025,
    zoomSpeed: 0.0005,
    starColor: '#073f2950',
  });

  return (
    <Layout title={title} description={description}>
      <Head>
        <meta name='theme-color' content='#000c05' />
      </Head>
      <div id='root'>
        <canvas ref={canvasRef} className='bg' />
        {children}
      </div>
    </Layout>
  );
};
