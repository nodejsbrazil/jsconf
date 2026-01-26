import type { FC } from 'react';
import { useRef } from 'react';
import { Github, Instagram, Link, Linkedin, Youtube } from 'lucide-react';
import { useScroll } from '@site/src/hooks/useScroll';
import Line from '../../assets/img/line.svg';
import { SafeLink } from './SafeLink';

type MemberProps = {
  name: string;
  img: string;
  position?: string;
  company?: string;
  bio?: string;
  linkedin?: string;
  instagram?: string;
  github?: string;
  youtube?: string;
  website?: string;
};

export const Person: FC<MemberProps> = ({
  name,
  img,
  position,
  company,
  bio,
  instagram,
  linkedin,
  github,
  youtube,
  website,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useScroll(ref, (isVisible, target) => {
    if (isVisible) target.classList.add('show');
  });

  return (
    <section ref={ref} className='person'>
      <header>
        <img src={img} alt={`Foto (${name})`} />
        <footer>
          {typeof linkedin === 'string' && (
            <SafeLink
              to={`https://linkedin.com/in/${linkedin.trim()}/`}
              title='LinkedIn'
            >
              <Linkedin />
            </SafeLink>
          )}
          {typeof instagram === 'string' && (
            <SafeLink
              to={`https://instagram.com/${instagram.trim()}/`}
              title='Instagram'
            >
              <Instagram />
            </SafeLink>
          )}
          {typeof youtube === 'string' && (
            <SafeLink
              className='youtube'
              to={`https://youtube.com/${youtube}`}
              title='YouTube'
            >
              <Youtube />
            </SafeLink>
          )}
          {typeof github === 'string' && (
            <SafeLink
              to={`https://github.com/${github.trim()}/`}
              title='GitHub'
            >
              <Github />
            </SafeLink>
          )}
          {typeof website === 'string' && (
            <SafeLink to={website.trim()} title='Website'>
              <Link />
            </SafeLink>
          )}
        </footer>
      </header>
      <main>
        <header>
          <h3>{name.trim()}</h3>
          {typeof position === 'string' && (
            <h4 className='position'>{position.trim()}</h4>
          )}
          {typeof company === 'string' && (
            <h5 className='company'>@ {company.trim()}</h5>
          )}
        </header>
        <Line className='line' />
        <main>
          {typeof bio === 'string' && <p className='bio'>{bio.trim()}</p>}
        </main>
      </main>
    </section>
  );
};
