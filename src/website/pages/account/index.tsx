import { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { BarChart3, LogOut, User } from 'lucide-react';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { Page } from '@site/src/website/components/shared/Page';
import { useLocalePath } from '@site/src/website/hooks/useLocalePath';
import '@site/src/website/scss/pages/voting.scss';
import '@site/src/website/scss/pages/admin.scss';

const Account = () => {
  const { siteConfig } = useDocusaurusContext();
  const workerDomain = siteConfig.customFields?.['workerDomain'] as
    | string
    | undefined;

  const { localePath } = useLocalePath();
  const [userId, setUserId] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [status, setStatus] = useState<'loading' | 'in' | 'out' | 'error'>(
    'loading'
  );

  useEffect(() => {
    if (!workerDomain) return setStatus('error');
    fetch(`${workerDomain}/api/vote/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return setStatus('error');
        // Anonymous is 200 { authenticated: false }, so the flag decides, not the status.
        const data = (await res.json()) as
          | { authenticated: true; userId: string; admin?: boolean }
          | { authenticated: false };
        if (!data.authenticated) return setStatus('out');
        setUserId(data.userId);
        setAdmin(data.admin === true);
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
        {/* Only organizers ever see this: `admin` comes from the session, which the server sets
            after guild.host confirmed the account can manage the event. */}
        {status === 'in' && admin && (
          <Link
            className='button button--primary button--sm admin-cta'
            to={localePath('/admin/votes')}
          >
            <BarChart3 className='icon' aria-hidden />
            <Text id='account.adminCta' />
          </Link>
        )}
      </div>
    </Page>
  );
};

export default Account;
