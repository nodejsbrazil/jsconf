import Link from '@docusaurus/Link';
import { Rss } from 'lucide-react';
import { FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { Text } from '@site/src/website/components/shared/i18n';
import { useLocalePath } from '@site/src/website/hooks/useLocalePath';
import Logo from '../../assets/img/logo.svg';
import { SafeLink } from '../shared/SafeLink';

export const Footer = () => {
  const { localePath } = useLocalePath();

  return (
    <footer className='main-footer'>
      <div className='content'>
        <aside className='about'>
          <h2 className='title'>
            <Logo className='logo' aria-hidden /> JSConf{' '}
            <span className='highlight'>Brasil</span>
          </h2>
          <p className='description'>
            <Text id='footer.description' />
          </p>
          <ul className='social'>
            <li>
              <SafeLink
                to='https://www.linkedin.com/company/jsconf-brazil'
                aria-label='LinkedIn'
                data-tooltip='LinkedIn'
              >
                <FaLinkedinIn size={24} />
              </SafeLink>
            </li>
            <li>
              <SafeLink
                to='https://x.com/jsconf_br'
                aria-label='Twitter'
                data-tooltip='Twitter'
              >
                <FaXTwitter size={24} />
              </SafeLink>
            </li>
            <li>
              <SafeLink
                to='https://www.instagram.com/jsconfbr/'
                aria-label='Instagram'
                data-tooltip='Instagram'
              >
                <FaInstagram size={24} />
              </SafeLink>
            </li>
            <li>
              <SafeLink
                to='https://nodebr.substack.com/about'
                aria-label='Substack (NodeBR)'
                data-tooltip='Substack (NodeBR)'
              >
                <Rss size={24} />
              </SafeLink>
            </li>
          </ul>
        </aside>
        <aside className='links'>
          <h3 className='title'>
            <Text id='footer.event' />
          </h3>
          <ul>
            <li>
              <Link to={localePath('/')}>
                <Text id='navbar.section.home' />
              </Link>
            </li>
            <li>
              <Link to={localePath('/#speakers')}>
                <Text id='navbar.section.speakers' />
              </Link>
            </li>
            <li>
              <Link to={localePath('/#location')}>
                <Text id='navbar.section.location' />
              </Link>
            </li>
            <li>
              <Link to={localePath('/sponsors')}>
                <Text id='navbar.section.sponsors' />
              </Link>
            </li>
            <li>
              <Link to={localePath('/brand')}>
                <Text id='brand.pageTitle' />
              </Link>
            </li>
            <li>
              <Link to={localePath('/coc')}>
                <Text id='coc.pageTitle' />
              </Link>
            </li>
          </ul>
        </aside>
      </div>
      <div className='footnote'>
        <Text id='footer.copyright' />{' '}
        <SafeLink to='https://nodebr.org'>NodeBR</SafeLink>.
      </div>
    </footer>
  );
};
