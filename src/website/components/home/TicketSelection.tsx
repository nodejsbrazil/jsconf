import { useRef } from 'react';
import { SquareArrowOutUpRight, Ticket } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
import { link } from '@site/src/website/configs/definitions';
import { useScroll } from '../../hooks/useScroll';
import { SafeLink } from '../shared/SafeLink';

// Tickets are sold on Sympla, whose public API exposes no ticket types or prices, so the card is a
// plain call to action instead of a live tier list.
const TicketCard = () => (
  <SafeLink to={link.tickets} className='ticket-card'>
    <span className='ticket-cta'>
      <Text id='tickets.cta' />
      <SquareArrowOutUpRight className='cta-icon' />
    </span>
  </SafeLink>
);

export const TicketSelection = () => {
  const ref = useRef<HTMLDivElement>(null);

  useScroll(ref, (isVisible, target) => {
    target.className = isVisible ? 'content show' : 'content';
  });

  return (
    <section id='tickets' className='landing-section'>
      <div className='content' ref={ref}>
        <h2 className='title'>
          <Ticket className='icon' /> <Text id='tickets.title' />
        </h2>
        <small className='subtitle'>
          <Text id='tickets.subtitle' />
        </small>
        <TicketCard />
      </div>
    </section>
  );
};
