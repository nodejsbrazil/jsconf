import type { CSSProperties } from 'react';
import type { Partner } from '../../configs/definitions';
import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
import { SafeLink } from '@site/src/website/components/shared/SafeLink';
import { link, partners } from '../../configs/definitions';
import { useScroll } from '../../hooks/useScroll';
import { Image } from '../shared/Image';

// `scss/pages/_partners.scss` caps `.logo` on both axes: `max-width: 100%` of the
// bay's content box and `max-height: 7rem` (5.6rem under 630px). `.bays` is one
// auto-column per partner inside a `.content` that stops at 112rem, each `.bay` is
// padded 2rem per side, and the row stacks one bay per line under 630px.
//
// Which cap bites first depends on the logo: the wide wordmarks fill their bay, the
// compact ones run out of height at a third of it. So the slot is the smaller of the
// two, per partner. `--logo-scale` is left out on purpose — it is a transform, it
// only ever shrinks the logo, and it changes on hover, which `sizes` cannot follow.
const logoSizes = (partner: Partner, bays: number) => {
  /** How wide this logo gets when it is the height cap that stops it, not the bay. */
  const atHeightCap = (capRem: number) =>
    `${((capRem * partner.width) / partner.height).toFixed(2)}rem`;

  return [
    `(max-width: 630px) min(100vw - 8rem, ${atHeightCap(5.6)})`,
    `(max-width: 1280px) min((100vw - 16rem) / ${bays} - 4rem, ${atHeightCap(7)})`,
    `min(112rem / ${bays} - 4rem, ${atHeightCap(7)})`,
  ].join(', ');
};

export const Partners = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [active, setActive] = useState(0);

  useScroll(ref, (isVisible) => {
    if (isVisible) setShow(true);
  });

  return (
    <section id='partners' className='landing-section'>
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
                  width={partner.width}
                  height={partner.height}
                  sizes={logoSizes(partner, partners.length)}
                  // The rail clears the fold on a standard desktop viewport and
                  // carries the largest images up there, so it is the LCP
                  // candidate: never deferred, never queued behind the grids.
                  loading='eager'
                  fetchPriority='high'
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
