import { Benefits } from '../components/home/Benefits';
import { Gallery } from '../components/home/Gallery';
import { Home } from '../components/home/Home';
import { Location } from '../components/home/Location';
import { Partners } from '../components/home/Partners';
// import { Speakers } from '../components/home/Speakers';
import { TicketSelection } from '../components/home/TicketSelection';
import { Waitlist } from '../components/home/Waitlist';
import { Page } from '../components/shared/Page';

export default () => (
  <Page description='A maior conferência de JavaScript do Mundo está de volta!'>
    <Home />
    <Partners />
    <Benefits />
    <Gallery />
    {/* <Speakers /> */}
    <TicketSelection />
    <Waitlist />
    <Location />
  </Page>
);
