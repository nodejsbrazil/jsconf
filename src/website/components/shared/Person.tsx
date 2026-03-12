import type { FC } from 'react';
import { useRef } from 'react';
import {
  Building,
  Github,
  Instagram,
  Link,
  Linkedin,
  Youtube,
} from 'lucide-react';
import { SafeLink } from '@site/src/website/components/shared/SafeLink';
import { useScroll } from '@site/src/website/hooks/useScroll';

type SocialLinks = {
  linkedin?: string;
  instagram?: string;
  github?: string;
  youtube?: string;
  website?: string;
};

type MemberProps = {
  name: string;
  img: string;
  position?: string;
  company?: string;
  bio?: string;
  social?: SocialLinks;
};

export const Person: FC<MemberProps> = ({
  name,
  img,
  position,
  company,
  bio,
  social,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useScroll(ref, (isVisible, target) => {
    if (isVisible) target.classList.add('show');
  });

  return (
    <section ref={ref} className='person'>
      <header className='photo'>
        <img className='image' src={img} alt={`Foto (${name})`} />
        {social && (
          <footer className='social'>
            {social.linkedin && (
              <SafeLink
                to={`https://linkedin.com/in/${social.linkedin.trim()}/`}
                title='LinkedIn'
              >
                <Linkedin />
              </SafeLink>
            )}
            {social.instagram && (
              <SafeLink
                to={`https://instagram.com/${social.instagram.trim()}/`}
                title='Instagram'
              >
                <Instagram />
              </SafeLink>
            )}
            {social.youtube && (
              <SafeLink
                className='youtube'
                to={`https://youtube.com/${social.youtube}`}
                title='YouTube'
              >
                <Youtube />
              </SafeLink>
            )}
            {social.github && (
              <SafeLink
                to={`https://github.com/${social.github.trim()}/`}
                title='GitHub'
              >
                <Github />
              </SafeLink>
            )}
            {social.website && (
              <SafeLink to={social.website.trim()} title='Website'>
                <Link />
              </SafeLink>
            )}
          </footer>
        )}
      </header>
      <main className='info'>
        <header className='details'>
          <h3 className='name'>{name.trim()}</h3>
          {typeof position === 'string' && (
            <h4 className='position'>{position.trim()}</h4>
          )}
          {typeof company === 'string' && (
            <h5 className='company'>
              <Building /> {company.trim()}
            </h5>
          )}
        </header>
        <main className='content'>
          {typeof bio === 'string' && <p className='bio'>{bio.trim()}</p>}
        </main>
      </main>
    </section>
  );
};
