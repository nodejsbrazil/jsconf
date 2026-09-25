import {
  SYMPLA_API,
  SYMPLA_EVENT_ID,
  SYMPLA_PAID_ORDER_STATUS,
} from '../configs/sympla.js';

export type SymplaParticipant = {
  email?: string;
  first_name?: string;
  order_status?: string;
};

type CancelledPage = {
  data?: { ticket_number?: string }[];
  pagination?: { next_cursor?: string | null };
};

// Ticket numbers of every cancelled or refunded ticket in the event. `cancelled_filter=only` makes
// Sympla return just those, so this is one request per 500 cancellations. Recursive so it pages
// without a `let` cursor. null means Sympla could not be reached, so the caller can say the
// tally was not checked instead of silently counting everything.
// ponytail: capped at 20 pages (10k cancellations); raise it if the event ever gets near that.
export const fetchCancelledTickets = async (
  token: string,
  cursor: string = '',
  found: Set<string> = new Set(),
  pagesLeft: number = 20
): Promise<Set<string> | null> => {
  if (pagesLeft <= 0) return found;
  const next = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
  const res = await fetch(
    `${SYMPLA_API}/events/${SYMPLA_EVENT_ID}/participants?cancelled_filter=only&fields=ticket_number&page_size=500${next}`,
    { headers: { s_token: token } }
  ).catch(() => null);
  if (!res || !res.ok) {
    if (res) console.log('[sympla] cancelled status', res.status);
    return null;
  }
  const body = (await res.json().catch(() => null)) as CancelledPage | null;
  if (!body) return null;
  for (const row of body.data ?? [])
    if (row.ticket_number) found.add(row.ticket_number);
  const nextCursor = body.pagination?.next_cursor;
  if (!nextCursor) return found;
  return fetchCancelledTickets(token, nextCursor, found, pagesLeft - 1);
};

// Sympla prints ticket numbers as `UV8M-ZA-U6D6` and its lookup only matches that exact shape
// (uppercase, dashes). People also type it lowercase or copy the dashless QR form `UV8MZAU6D6`, so
// uppercase it and put the dashes back on a bare 10-character code.
// ponytail: assumes the 4-2-4 shape seen on real tickets (2026-09-25); anything else passes through
// unchanged and Sympla decides.
export const normalizeTicketNumber = (input: string): string => {
  const upper = input.trim().toUpperCase();
  const bare = upper.replace(/-/g, '');
  if (upper.includes('-') || bare.length !== 10) return upper;
  return `${bare.slice(0, 4)}-${bare.slice(4, 6)}-${bare.slice(6)}`;
};

// Looks up a ticket number in the event. An unknown ticket comes back as an empty participant,
// which fails `isValidSymplaLogin`: the spec says 204 for that, the live API answers 404 (checked
// 2026-09-25), so both count. null means Sympla could not be reached (or answered with another
// error), so callers can tell "bad ticket" from "try again".
export const fetchSymplaTicket = async (
  token: string,
  ticketNumber: string
): Promise<SymplaParticipant | null> => {
  const url = `${SYMPLA_API}/events/${SYMPLA_EVENT_ID}/participants/ticketNumber/${encodeURIComponent(ticketNumber)}?fields=email,first_name,order_status`;
  const res = await fetch(url, { headers: { s_token: token } }).catch(
    () => null
  );
  if (!res) return null;
  if (res.status === 204 || res.status === 404) return {};
  if (!res.ok) {
    // Logs status + body only, never the token.
    console.log('[sympla] status', res.status, await res.text());
    return null;
  }
  const body = (await res.json().catch(() => null)) as {
    data?: SymplaParticipant;
  } | null;
  return body?.data ?? {};
};

// A ticket logs in when its order is paid and the email matches the participant's. The ticket
// number is printed on the ticket and gets forwarded around; the email is what makes it a
// credential.
export const isValidSymplaLogin = (
  participant: SymplaParticipant,
  email: string
): boolean =>
  SYMPLA_PAID_ORDER_STATUS.includes(participant.order_status ?? '') &&
  participant.email?.trim().toLowerCase() === email.trim().toLowerCase();
