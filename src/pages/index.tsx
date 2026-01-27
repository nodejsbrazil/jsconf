import { Benefits } from '../components/home/Benefits';
import { Home } from '../components/home/Home';
import { Speakers } from '../components/home/Speakers';
import { Team } from '../components/home/Team';
import { Page } from '../components/shared/Page';

export default () => (
  <Page description='A maior conferência de JavaScript do Mundo está de volta!'>
    <Home />
    <Benefits />
    <Speakers />
    <Team />
  </Page>
);
