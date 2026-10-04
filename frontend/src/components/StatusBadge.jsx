import { memo } from 'react';
import { followUpKind, label } from '../utils/format';

const COLORS = { new: ['#DBEAFE', '#1D4ED8'], contacted: ['#e0e7ff', '#4338ca'], 'follow-up': ['#fef3c7', '#b45309'], converted: ['#dcfce7', '#15803d'], lost: ['#fee2e2', '#b91c1c'] };
const FOLLOW = {
  upcoming: ['#DBEAFE', '#1D4ED8', 'Upcoming'],
  'due-today': ['#fef3c7', '#b45309', 'Due today'],
  overdue: ['#fee2e2', '#b91c1c', 'Overdue'],
  completed: ['#dcfce7', '#15803d', 'Completed'],
};

function StatusBadge({ status }) {
  const [bg, fg] = COLORS[status] || ['#e2e8f0', '#334155'];
  return <span style={{ background: bg, color: fg, padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{label(status)}</span>;
}

export const FollowUpBadge = memo(function FollowUpBadge({ lead }) {
  const kind = followUpKind(lead);
  if (!kind) return <span style={{ color: '#64748B', fontSize: 12 }}>—</span>;
  const [bg, fg, text] = FOLLOW[kind];
  return <span style={{ background: bg, color: fg, padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{text}</span>;
});

export default memo(StatusBadge);
