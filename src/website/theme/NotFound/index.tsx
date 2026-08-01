import Head from '@docusaurus/Head';
import NotFound from '@theme-original/NotFound';

/**
 * The 404 is a real, crawlable route that canonicalizes itself to `/404.html/`, a URL that
 * cannot exist. Keeping it out of the index is the only fix available from a static host.
 */
export default function NotFoundWrapper() {
  return (
    <>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      <NotFound />
    </>
  );
}
