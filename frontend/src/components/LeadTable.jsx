import { memo } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { fmtDate, isOverdue, label } from '../utils/format';
import styles from './Leads.module.css';

const COLS = [['leadName', 'Lead'], ['status', 'Status'], ['leadSource', 'Source'], [null, 'Assigned'], ['nextFollowUpDate', 'Next follow-up']];

function LeadTable({ leads, sortBy, order, onSort, onDelete, canDelete }) {
  const arrow = (k) => (sortBy === k ? (order === 'asc' ? ' ▲' : ' ▼') : '');
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead><tr>
          {COLS.map(([key, text]) => key
            ? <th key={text} className={`${styles.sortable} ${key === 'leadSource' ? styles.hideSm : ''}`} onClick={() => onSort(key)}>{text}{arrow(key)}</th>
            : <th key={text} className={styles.hideSm}>{text}</th>)}
          <th />
        </tr></thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l._id}>
              <td><Link to={`/leads/${l._id}`} className={styles.name}>{l.leadName}</Link><span className={styles.sub}>{l.contactNumber}{l.email ? ` · ${l.email}` : ''}</span></td>
              <td><StatusBadge status={l.status} /></td>
              <td className={styles.hideSm}>{label(l.leadSource)}</td>
              <td className={styles.hideSm}>{l.assignedTo?.name || '—'}</td>
              <td className={isOverdue(l.nextFollowUpDate) && !['converted', 'lost'].includes(l.status) ? styles.overdue : ''}>{fmtDate(l.nextFollowUpDate)}{l.nextFollowUpTime ? ` · ${l.nextFollowUpTime}` : ''}</td>
              <td><div className={styles.actions}>
                <Link className="btn btn-sm" to={`/leads/${l._id}/edit`}>Edit</Link>
                {canDelete && <button className="btn btn-sm btn-danger" onClick={() => onDelete(l)}>Delete</button>}
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default memo(LeadTable);
