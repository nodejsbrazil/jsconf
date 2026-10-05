import { useRef } from 'react';
import { Ticket } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
import { useScroll } from '../../hooks/useScroll';

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
        <div className='ticket-card'>
          <span className='ticket-cta'>
            <Text id='tickets.cta' />
          </span>
        </div>
      </div>
    </section>
  );
};
