export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—');
export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
export const label = (s) => (s ? s.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : '—');
export const isOverdue = (d) => !!d && new Date(d) < new Date(new Date().toISOString().slice(0, 10));
export function followUpKind(lead) {
  if (['converted', 'lost'].includes(lead.status)) return 'completed';
  if (!lead.nextFollowUpDate) return null;
  const d = toInputDate(lead.nextFollowUpDate);
  const today = new Date().toISOString().slice(0, 10);
  if (d < today) return 'overdue';
  if (d === today) return 'due-today';
  return 'upcoming';
}
