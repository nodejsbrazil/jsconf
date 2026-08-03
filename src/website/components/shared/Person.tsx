import type { FC } from 'react';
import { memo, useRef } from 'react';
import { Building, Link } from 'lucide-react';
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa6';
import { text } from '@site/src/website/components/shared/i18n';
import { Image } from '@site/src/website/components/shared/Image';
import { SafeLink } from '@site/src/website/components/shared/SafeLink';
import { useScroll } from '@site/src/website/hooks/useScroll';

// `scss/pages/_speakers.scss`: the `.speakers` grid runs 4 columns / 3rem gap,
// then 3 columns at 1280px, 2 columns capped at 72rem at 1080px, and 1 column
// capped at 40rem at 780px. The widest a card ever gets is 35.5rem, in the
// 3-column band; below 440px the single column is just the padded viewport.
const PHOTO_SIZES = [
  '(max-width: 440px) calc(100vw - 4rem)',
  '(max-width: 780px) 40rem',
  '35.5rem',
].join(', ');

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
  /** Intrinsic pixel size of the photo file — the team's headshots are not uniform. */
  imgWidth: number;
  imgHeight: number;
  position?: string;
  company?: string;
  bio?: string;
  social?: SocialLinks;
};

export const Person: FC<MemberProps> = memo(
  ({ name, img, imgWidth, imgHeight, position, company, bio, social }) => {
    const ref = useRef<HTMLDivElement>(null);

    useScroll(ref, (isVisible, target) => {
      if (isVisible) target.classList.add('show');
    });

    return (
      <section ref={ref} className='team-detail-card'>
        <div className='team-detail-photo-wrap'>
          <Image
            className='team-detail-photo'
            src={img}
            alt={name}
            width={imgWidth}
            height={imgHeight}
            sizes={PHOTO_SIZES}
          />
        </div>

        <div className='team-detail-body'>
          <h3 className='team-detail-name'>{name}</h3>
          {position && <p className='team-detail-position'>{position}</p>}
          {company && (
            <p className='team-detail-company'>
              <Building size={13} /> {company}
            </p>
          )}
          {bio && <p className='team-detail-bio'>{bio}</p>}

          {social && (
            <footer className='team-detail-social'>
              {social.linkedin && (
                <SafeLink
                  to={`https://linkedin.com/in/${social.linkedin.trim()}/`}
                  title='LinkedIn'
                >
                  <FaLinkedinIn size={16} />
                </SafeLink>
              )}
              {social.instagram && (
                <SafeLink
                  to={`https://instagram.com/${social.instagram.trim()}/`}
                  title='Instagram'
                >
                  <FaInstagram size={16} />
                </SafeLink>
              )}
              {social.youtube && (
                <SafeLink
                  to={`https://youtube.com/${social.youtube.trim()}/`}
                  title='YouTube'
                >
                  <FaYoutube size={16} />
                </SafeLink>
              )}
              {social.github && (
                <SafeLink
                  to={`https://github.com/${social.github.trim()}/`}
                  title='GitHub'
                >
                  <FaGithub size={16} />
                </SafeLink>
              )}
              {social.website && (
                <SafeLink
                  to={social.website.trim()}
                  title={text({ id: 'common.website' })}
                >
                  <Link size={16} />
                </SafeLink>
              )}
            </footer>
          )}
        </div>
      </section>
    );
  }
);
