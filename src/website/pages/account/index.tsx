import { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { LogOut, User } from 'lucide-react';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { Page } from '@site/src/website/components/shared/Page';
import '@site/src/website/scss/pages/voting.scss';

const Account = () => {
  const { siteConfig } = useDocusaurusContext();
  const workerDomain = siteConfig.customFields?.['workerDomain'] as
    | string
    | undefined;

  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'in' | 'out' | 'error'>(
    'loading'
  );

  useEffect(() => {
    if (!workerDomain) return setStatus('error');
    fetch(`${workerDomain}/api/vote/me`, { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 401) return setStatus('out');
        if (!res.ok) return setStatus('error');
        const data = (await res.json()) as { userId: string };
        setUserId(data.userId);
        setStatus('in');
      })
      .catch(() => setStatus('error'));
  }, [workerDomain]);

  return (
    <Page title={text({ id: 'account.title' })} noindex>
      <div className='account-page page-content'>
        <header className='page-hero'>
          <h1 className='title'>
            <User className='icon' aria-hidden />
            <Text id='account.heading' />
          </h1>
        </header>

        {status === 'loading' && (
          <p className='status'>
            <Text id='common.loading' />
          </p>
        )}
        {status === 'error' && (
          <p className='status error'>
            <Text id='account.loadError' />
          </p>
        )}
        {status === 'out' && (
          <div className='login-hero'>
            <h2 className='login-title'>
              <Text id='account.loginHeading' />
            </h2>
            <p className='login-text'>
              <Text id='account.loginPrompt' />
            </p>
            <a className='login-cta' href={`${workerDomain}/api/vote/login`}>
              <Text id='auth.login' />
            </a>
          </div>
        )}
        {status === 'in' && userId && (
          <div className='account-card'>
            <div className='account-identity'>
              <div className='avatar'>
                <User className='icon' aria-hidden />
              </div>
              <div>
                <p className='account-id-label'>
                  <Text id='account.idLabel' />
                </p>
                <p className='account-id-value'>{userId}</p>
              </div>
            </div>
            <a
              className='button button--secondary button--sm logout-link'
              href={`${workerDomain}/api/vote/logout`}
            >
              <LogOut className='icon' aria-hidden />
              <Text id='auth.logout' />
            </a>
          </div>
        )}
      </div>
    </Page>
  );
};

export default Account;
