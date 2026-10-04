import { memo } from 'react';
import { SOURCES, STATUSES } from '../constants';
import { label } from '../utils/format';
import styles from './Leads.module.css';

function LeadFilters({ filters, users, onChange, onReset }) {
  const opt = (arr) => arr.map((v) => <option key={v} value={v}>{label(v)}</option>);
  return (
    <div className={styles.filters}>
      <input className="input" placeholder="Search leads…" value={filters.search} onChange={(e) => onChange({ search: e.target.value })} aria-label="Search leads" />
      <select className="input" value={filters.status} onChange={(e) => onChange({ status: e.target.value })} aria-label="Filter by status"><option value="">Status</option>{opt(STATUSES)}</select>
      <select className="input" value={filters.leadSource} onChange={(e) => onChange({ leadSource: e.target.value })} aria-label="Filter by source"><option value="">Source</option>{opt(SOURCES)}</select>
      <select className="input" value={filters.assignedTo} onChange={(e) => onChange({ assignedTo: e.target.value })} aria-label="Filter by assignee">
        <option value="">Assigned To</option>{users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
      </select>
      <button className="btn" onClick={onReset}>Reset</button>
    </div>
  );
}
export default memo(LeadFilters);
