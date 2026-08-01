import { useEffect, useRef, useState } from 'react';
import { SquareArrowOutUpRight, Ticket } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
import { link } from '@site/src/website/configs/definitions';
import { useScroll } from '../../hooks/useScroll';
import { SafeLink } from '../shared/SafeLink';

const GUILD_API =
  'https://guild.host/graphql/2003081008408bdeed2a1d4fc2ecdbb189041fca778aea0d9884030f981c75dd';
const GUILD_SLUG = 'vdc8dh';

type TierNode = {
  id: string;
  name: string;
  description: string | null;
  priceAmountCents?: number | null;
  priceCurrency?: string | null;
};

type GuildResponse = {
  data: {
    event: {
      eventTicketingTiers: {
        edges: Array<{ node: TierNode }>;
      };
    };
  };
};

function formatPrice(
  cents: number | null | undefined,
  currency: string | null | undefined
): string | null {
  if (cents == null) return null;
  const amount = cents / 100;
  if (currency === 'BRL')
    return `R$${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
  return `${currency ?? ''} ${amount.toFixed(2)}`.trim() || null;
}

const TicketCard = () => {
  const [tiers, setTiers] = useState<TierNode[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(GUILD_API, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-gqlvars': JSON.stringify({ slug: GUILD_SLUG }),
      },
      signal: controller.signal,
    })
      .then<GuildResponse>((r) => r.json())
      .then((data) => {
        const edges = data?.data?.event?.eventTicketingTiers?.edges ?? [];
        setTiers(edges.map((e) => e.node));
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return (
    <SafeLink to={link.tickets} className='ticket-card'>
      {tiers.length > 0 && (
        <ul className='tier-list'>
          {tiers.map((tier) => {
            const price = formatPrice(
              tier.priceAmountCents,
              tier.priceCurrency
            );
            return (
              <li key={tier.id} className='tier-item'>
                <div className='tier-row'>
                  <div className='tier-info'>
                    <strong className='tier-name'>{tier.name}</strong>
                    {tier.description && (
                      <p className='tier-description'>
                        {tier.description.charAt(0).toUpperCase() +
                          tier.description.slice(1)}
                      </p>
                    )}
                  </div>
                  {price && <span className='tier-price'>{price}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <SquareArrowOutUpRight className='cta-icon' />
    </SafeLink>
  );
};

export const TicketSelection = () => {
  const ref = useRef<HTMLDivElement>(null);

  useScroll(ref, (isVisible, target) => {
    target.className = isVisible ? 'content show' : 'content';
  });

  return (
    <section id='tickets'>
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
