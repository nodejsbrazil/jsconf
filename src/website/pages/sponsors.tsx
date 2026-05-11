import { Sponsors } from '@site/src/website/components/home/Sponsors';
import { text } from '@site/src/website/components/shared/i18n';
import { Page } from '@site/src/website/components/shared/Page';

export default () => (
  <Page
    title={text({ id: 'sponsors.pageTitle' })}
    description={text({ id: 'sponsors.pageDescription' })}
  >
    <Sponsors />
  </Page>
);
