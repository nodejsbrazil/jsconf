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

// Looks up a ticket number in the event. An unknown ticket (Sympla answers 204) comes back as an
// empty participant, which fails `isValidSymplaLogin`. null means Sympla could not be reached (or
// answered with an error), so callers can tell "bad ticket" from "try again".
export const fetchSymplaTicket = async (
  token: string,
  ticketNumber: string
): Promise<SymplaParticipant | null> => {
  const url = `${SYMPLA_API}/events/${SYMPLA_EVENT_ID}/participants/ticketNumber/${encodeURIComponent(ticketNumber)}?fields=email,first_name,order_status`;
  const res = await fetch(url, { headers: { s_token: token } }).catch(
    () => null
  );
  if (!res) return null;
  if (res.status === 204) return {};
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
// number alone is guessable (event prefix + sequence), the email is what makes it a credential.
export const isValidSymplaLogin = (
  participant: SymplaParticipant,
  email: string
): boolean =>
  SYMPLA_PAID_ORDER_STATUS.includes(participant.order_status ?? '') &&
  participant.email?.trim().toLowerCase() === email.trim().toLowerCase();
