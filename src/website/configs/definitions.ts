export const link = {
  tickets: 'https://guild.host/events/jsconf-brasil-primeira-vdc8dh',
  sponsors: 'https://forms.gle/SPyyD3SsuurVpvCNA',
} as const;

/**
 * The event, in the fixed formats schema.org wants. Every human-readable version of this
 * lives in i18n (`location.venue.*`); only the parts a crawler needs verbatim are here.
 */
export const event = {
  /** Date with no time: the schedule is not published yet, so no start hour is claimed. */
  startDate: '2026-11-28',
  /** Single-day event, so this matches `startDate`. Google wants it stated, not inferred. */
  endDate: '2026-11-28',
  venue: {
    shortName: 'USCS',
    locality: 'São Caetano do Sul',
    region: 'SP',
    country: 'BR',
  },
} as const;

/** Official accounts, the same set the footer links. Used as schema.org `sameAs`. */
export const social = [
  'https://www.linkedin.com/company/jsconf-brazil',
  'https://x.com/jsconf_br',
  'https://www.instagram.com/jsconfbr/',
] as const;

export type Partner = {
  name: string;
  logo: string;
  url: string;
  /** Intrinsic pixel size of the logo file, so the bay reserves its box up front. */
  width: number;
  height: number;
  /** Optical size tuning: logos differ in visual mass at the same box size. */
  scale?: number;
};

export const partners: Partner[] = [
  {
    // Compact logotype (1.9:1) — fills the height cap long before the others.
    name: 'Salvy',
    logo: '/img/partners/salvy.webp',
    url: 'https://salvy.com.br/',
    width: 390,
    height: 208,
    scale: 0.95,
  },
  {
    // Very wide wordmark (6.3:1) — width-bound rather than height-bound.
    name: 'Cod3rs',
    logo: '/img/partners/cod3rs.webp',
    url: 'https://www.coders.com.br/',
    width: 900,
    height: 143,
    scale: 0.8,
  },
  {
    name: 'UniPDS Educação',
    logo: '/img/partners/unipds.webp',
    url: 'https://unipds.com.br/',
    width: 900,
    height: 263,
    scale: 0.7,
  },
];
