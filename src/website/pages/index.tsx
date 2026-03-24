import { Benefits } from '../components/home/Benefits';
import { Home } from '../components/home/Home';
import { Location } from '../components/home/Location';
// import { Speakers } from '../components/home/Speakers';
import { Team } from '../components/home/Team';
import { TicketSelection } from '../components/home/TicketSelection';
import { Waitlist } from '../components/home/Waitlist';
import { Page } from '../components/shared/Page';

export default () => (
  <Page description='A maior conferência de JavaScript do Mundo está de volta!'>
    <Home />
    <Benefits />
    {/* <Speakers /> */}
    <TicketSelection />
    <Waitlist />
    <Location />
    <Team />
  </Page>
);
