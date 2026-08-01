import Head from '@docusaurus/Head';

/**
 * Emits a schema.org graph as JSON-LD.
 *
 * Helmet writes script children out raw, so a `<` coming from a translated string would close
 * the tag early. Escaping it to `<` keeps the JSON valid and the markup intact.
 */
export const StructuredData = ({ graph }: { graph: object }) => (
  <Head>
    <script type='application/ld+json'>
      {JSON.stringify(graph).replace(/</g, '\\u003c')}
    </script>
  </Head>
);
