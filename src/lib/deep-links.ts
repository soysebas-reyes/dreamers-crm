// Channel deep-links (PRD §7.1, §7.7) — the CRM launches the real
// conversation rather than replacing it.

export function waLink(e164Phone: string): string {
  const digits = e164Phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

export function mailtoLink(email: string): string {
  return `mailto:${email}`;
}
