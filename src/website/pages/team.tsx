import { Team } from '../components/home/Team';
import { text } from '../components/shared/i18n';
import { Page } from '../components/shared/Page';

export default () => (
  <Page
    title={text({ id: 'navbar.section.team' })}
    description={text({ id: 'team.pageDescription' })}
  >
    <Team />
  </Page>
);
