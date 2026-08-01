import { Benefits } from '../components/home/Benefits';
import { Gallery } from '../components/home/Gallery';
import { Home } from '../components/home/Home';
import { Location } from '../components/home/Location';
import { Partners } from '../components/home/Partners';
// import { Speakers } from '../components/home/Speakers';
import { TicketSelection } from '../components/home/TicketSelection';
import { Waitlist } from '../components/home/Waitlist';
import { EventSchema } from '../components/shared/EventSchema';
import { text } from '../components/shared/i18n';
import { Page } from '../components/shared/Page';

export default () => (
  <Page
    title={text({ id: 'home.pageTitle' })}
    description={text({ id: 'home.pageDescription' })}
  >
    <EventSchema />
    <main>
      <Home />
      <Partners />
      <Benefits />
      <Gallery />
      {/* <Speakers /> */}
      <TicketSelection />
      <Waitlist />
      <Location />
    </main>
  </Page>
);
