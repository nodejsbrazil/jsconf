import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { event, link, social } from '../../configs/definitions';
import { text } from './i18n';
import { StructuredData } from './StructuredData';

/**
 * The homepage-only `Event` graph, which is what makes the site eligible for Google's event
 * rich result. `name`, `startDate` and a `location` with an address are the required fields;
 * the rest is what the result will show if it is there.
 *
 * Every string a reader sees comes from i18n, so each locale describes the same event in its
 * own language while the dates and the address stay identical across all three.
 */
export const EventSchema = () => {
  const { siteConfig } = useDocusaurusContext();
  const { withBaseUrl } = useBaseUrlUtils();

  return (
    <StructuredData
      graph={{
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: siteConfig.title,
        description: text({ id: 'home.pageDescription' }),
        startDate: event.startDate,
        endDate: event.endDate,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        url: withBaseUrl('/', { absolute: true }),
        image: `${siteConfig.url}/img/og-card.png`,
        inLanguage: 'pt-BR',
        organizer: {
          '@type': 'Organization',
          '@id': `${siteConfig.url}/#organization`,
          name: siteConfig.title,
          url: `${siteConfig.url}/`,
          sameAs: [...social],
        },
        location: {
          '@type': 'Place',
          name: text({ id: 'location.venue.address' }),
          alternateName: event.venue.shortName,
          address: {
            '@type': 'PostalAddress',
            addressLocality: event.venue.locality,
            addressRegion: event.venue.region,
            addressCountry: event.venue.country,
          },
        },
        offers: {
          '@type': 'Offer',
          url: link.tickets,
          availability: 'https://schema.org/InStock',
          price: event.offer.price,
          priceCurrency: event.offer.currency,
        },
      }}
    />
  );
};
