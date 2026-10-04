import { useEffect, useRef } from 'react';
import { useLeads } from '../context/LeadsContext';
import { useToast } from '../context/ToastContext';

export default function useReminders(intervalMs = 60000) {
  const { reminders, fetchReminders } = useLeads();
  const { notify } = useToast();
  const seen = useRef(new Set());

  useEffect(() => {
    fetchReminders();
    const t = setInterval(fetchReminders, intervalMs);
    return () => clearInterval(t);
  }, [fetchReminders, intervalMs]);

  useEffect(() => {
    const fresh = reminders.filter((l) => !seen.current.has(l._id));
    if (!fresh.length) return;
    fresh.forEach((l) => seen.current.add(l._id));
    notify(`${fresh.length} follow-up${fresh.length > 1 ? 's' : ''} due: ${fresh.slice(0, 2).map((l) => l.leadName).join(', ')}${fresh.length > 2 ? '…' : ''}`, 'warning');
  }, [reminders, notify]);
}
