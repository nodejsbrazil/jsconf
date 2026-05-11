import '@site/src/website/scss/pages/root.scss';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';

type PageProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export const Page = ({ title, description, children }: PageProps) => {
  return (
    <Layout title={title} description={description}>
      <Head>
        <meta name='theme-color' content='#000c05' />
      </Head>
      <div id='root'>{children}</div>
    </Layout>
  );
};
