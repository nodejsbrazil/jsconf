import '@site/src/website/scss/pages/root.scss';
import Head from '@docusaurus/Head';
import { useLocation } from '@docusaurus/router';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { social } from '../../configs/definitions';
import { text } from './i18n';
import { StructuredData } from './StructuredData';

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
  const { siteConfig, i18n } = useDocusaurusContext();
  const { withBaseUrl } = useBaseUrlUtils();
  const { pathname } = useLocation();

  // `baseUrl` already carries the locale prefix in a localized build, so this is `/` on pt-BR
  // and `/en-US/` on en-US, and the absolute form is the locale's home page.
  const basePath = withBaseUrl('/');
  const homeUrl = withBaseUrl('/', { absolute: true });
  const pageUrl = siteConfig.url + pathname;

  // One organization across every locale; one website node per locale, since each has its own
  // home URL and language.
  const organizationId = `${siteConfig.url}/#organization`;
  const graph: object[] = [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: siteConfig.title,
      // Not `siteConfig.tagline`: that is one fixed pt-BR string, and this node is emitted on
      // the English and Spanish pages too.
      description: text({ id: 'home.pageDescription' }),
      url: `${siteConfig.url}/`,
      logo: `${siteConfig.url}/img/logo.png`,
      sameAs: [...social],
    },
    {
      '@type': 'WebSite',
      '@id': `${homeUrl}#website`,
      name: siteConfig.title,
      url: homeUrl,
      inLanguage: i18n.currentLocale,
      publisher: { '@id': organizationId },
    },
  ];

  // Breadcrumbs only make sense once there is somewhere to come back from, so they go on the
  // one-level-deep routes (/team, /sponsors, /coc, /brand, /c4p) and nowhere else.
  const section = pathname.slice(basePath.length).replace(/\/$/, '');
  if (title && section.length > 0 && !section.includes('/')) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: siteConfig.title,
          item: homeUrl,
        },
        { '@type': 'ListItem', position: 2, name: title, item: pageUrl },
      ],
    });
  }

  return (
    <Layout title={title} description={description}>
      <Head>
        <meta name='theme-color' content='#000c05' />
        {noindex && <meta name='robots' content='noindex, follow' />}
      </Head>
      <StructuredData
        graph={{ '@context': 'https://schema.org', '@graph': graph }}
      />
      {/* Docusaurus's Layout wraps content in a plain div, so this is every route's main landmark. */}
      <main id='root'>{children}</main>
    </Layout>
  );
};
