import { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { ChevronDown, User } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
import { useLocalePath } from '@site/src/website/hooks/useLocalePath';

// /api/vote/me returns the session identity. name/photo come from the guild userinfo; when absent
// we fall back to the userId + a generic icon.
type Me = { userId: string; name?: string; photo?: string };

export const AuthButton = () => {
  const { siteConfig } = useDocusaurusContext();
  const workerDomain = siteConfig.customFields?.['workerDomain'] as
    | string
    | undefined;
  const { localePath } = useLocalePath();
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!workerDomain) return;
    fetch(`${workerDomain}/api/vote/me`, { credentials: 'include' })
      .then((res) => (res.ok ? (res.json() as Promise<Me>) : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, [workerDomain]);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  // Misconfigured worker domain: no functional auth endpoints, so render nothing.
  if (!workerDomain) return null;

  // Logged out (and during load): a plain "log in" button that starts the OAuth flow.
  if (!me)
    return (
      <a className='account' href={`${workerDomain}/api/vote/login`}>
        <User /> <Text id='navbar.login' />
      </a>
    );

  // Logged in: name + photo toggles a dropdown with Votar / Sair.
  return (
    <div className='account-menu' ref={ref}>
      <button
        type='button'
        className='account'
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {me.photo ? <img className='avatar' src={me.photo} alt='' /> : <User />}
        <span>{me.name ?? me.userId}</span>
        <ChevronDown className='chevron' />
      </button>
      {open && (
        <div className='account-dropdown'>
          <Link to={localePath('/vote')} onClick={() => setOpen(false)}>
            <Text id='navbar.vote' />
          </Link>
          <a href={`${workerDomain}/api/vote/logout`}>
            <Text id='auth.logout' />
          </a>
        </div>
      )}
    </div>
  );
};
