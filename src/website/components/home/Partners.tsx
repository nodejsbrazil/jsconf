import type { CSSProperties } from 'react';
import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
import { SafeLink } from '@site/src/website/components/shared/SafeLink';
import { link, partners } from '../../configs/definitions';
import { useScroll } from '../../hooks/useScroll';
import { Image } from '../shared/Image';

export const Partners = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [active, setActive] = useState(0);

  useScroll(ref, (isVisible) => {
    if (isVisible) setShow(true);
  });

  return (
    <section id='partners'>
      <div className={show ? 'content show' : 'content'} ref={ref}>
        <p className='eyebrow'>
          <Text id='partners.eyebrow' />
        </p>

        <div className='rail'>
          <div className='bays'>
            {partners.map((partner, index) => (
              <SafeLink
                key={partner.name}
                to={partner.url}
                className={index === active ? 'bay active' : 'bay'}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
              >
                <Image
                  className='logo'
                  src={partner.logo}
                  alt={partner.name}
                  loading='eager'
                  style={
                    { '--logo-scale': partner.scale ?? 1 } as CSSProperties
                  }
                />
              </SafeLink>
            ))}
          </div>

          <div className='track'>
            <span
              className='segment'
              style={
                {
                  '--bays': partners.length,
                  '--active': active,
                } as CSSProperties
              }
            />
          </div>
        </div>

        <div className='invite'>
          <p className='invite-text'>
            <Text id='partners.cta.text' />
          </p>
          <SafeLink to={link.sponsors} className='invite-button'>
            <Text id='partners.cta.button' /> <ArrowRight className='icon' />
          </SafeLink>
        </div>
      </div>
    </section>
  );
};
