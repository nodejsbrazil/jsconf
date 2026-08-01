import '@site/src/website/scss/pages/root.scss';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';

type PageProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  /**
   * For routes that fetch their content client-side: they build to an empty shell, which a
   * crawler reads as thin content or a soft 404. `follow` so the links out still count.
   */
  noindex?: boolean;
};

export const Page = ({ title, description, noindex, children }: PageProps) => {
  return (
    <Layout title={title} description={description}>
      <Head>
        <meta name='theme-color' content='#000c05' />
        {noindex && <meta name='robots' content='noindex, follow' />}
      </Head>
      <div id='root'>{children}</div>
    </Layout>
  );
};
