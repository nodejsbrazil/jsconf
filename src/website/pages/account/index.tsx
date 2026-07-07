import { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Page } from '@site/src/website/components/shared/Page';

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
    <Page title='Conta - JSConf Brasil 2026'>
      <div className='page-content flex w-full max-w-[80rem] flex-col gap-[1.6rem] px-[2rem] py-[4rem]'>
        <h1>Conta</h1>

        {status === 'loading' && <p>Carregando…</p>}
        {status === 'error' && (
          <p>Não foi possível carregar. Tente mais tarde.</p>
        )}
        {status === 'out' && (
          <a
            className='button button--primary'
            href={`${workerDomain}/api/vote/login`}
          >
            Entrar com guild.host
          </a>
        )}
        {status === 'in' && userId && (
          <div className='flex items-center justify-between gap-[1.2rem]'>
            <strong>{userId}</strong>
            <a href={`${workerDomain}/api/vote/logout`}>Sair</a>
          </div>
        )}
      </div>
    </Page>
  );
};

export default Account;
