import '@site/src/website/css/c4p.css';
import '@site/src/website/scss/pages/voting.scss';
import { MicOff } from 'lucide-react';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { Page } from '@site/src/website/components/shared/Page';

// The Call for Papers closed for JSConf Brasil 2026. The multi-step form (contexts/c4p,
// hooks/c4p/useSubmit, pages/c4p/_components/*) stays in the repo because the submitted talks
// are still being voted on, but this page no longer renders it, so nobody can reach the form or
// its submit button from the URL. The trust boundary is `POST /api/c4p`
// (src/server/routes/c4p.ts), which rejects with 403 regardless of what the frontend does.
export default () => (
  <Page
    title={text({ id: 'c4p.pageTitle' })}
    description={text({ id: 'c4p.pageDescription' })}
    noindex
  >
    <div className='c4p-page page-content'>
      <header className='page-hero'>
        <h1 className='title'>
          <MicOff className='icon' aria-hidden />
          <Text id='c4p.closed.heading' />
        </h1>
        <p className='subtitle'>
          <Text id='c4p.closed.subheading' />
        </p>
      </header>
      <p className='status'>
        <Text id='c4p.closed.status' />
      </p>
    </div>
  </Page>
);
