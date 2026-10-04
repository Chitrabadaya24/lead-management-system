import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';
import StatusBadge, { FollowUpBadge } from '../components/StatusBadge';
import { STATUSES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useLeads } from '../context/LeadsContext';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import { getErrorMessage, leadService } from '../services/api';
import { followUpKind, fmtDate, isOverdue, label, toInputDate } from '../utils/format';
import styles from '../components/Leads.module.css';
import local from './FollowUps.module.css';

const KINDS = [
  { id: '', text: 'All due states' },
  { id: 'upcoming', text: 'Upcoming' },
  { id: 'due-today', text: 'Due today' },
  { id: 'overdue', text: 'Overdue' },
  { id: 'completed', text: 'Completed' },
];

export default function FollowUps() {
  const { isAdmin } = useAuth();
  const { deleteLead } = useLeads();
  const { notify } = useToast();
  const [filters, setFilters] = useState({ search: '', status: '', date: '', kind: '', sortBy: 'nextFollowUpDate', order: 'asc', page: 1, limit: 10 });
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const search = useDebounce(filters.search, 400);

  const params = useMemo(() => Object.fromEntries(Object.entries({
    search, status: filters.status, sortBy: filters.sortBy, order: filters.order, page: filters.page, limit: filters.limit,
  }).filter(([, v]) => v !== '')), [search, filters.status, filters.sortBy, filters.order, filters.page, filters.limit]);

  const load = useCallback(() => {
    setLoading(true); setError('');
    leadService.list(params)
      .then((r) => { setItems(r.data || []); setPagination(r.pagination || { page: 1, pages: 1, total: 0, limit: 10 }); })
      .catch((e) => { setError(getErrorMessage(e)); setItems([]); })
      .finally(() => setLoading(false));
  }, [params]);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => items.filter((l) => {
    if (!l.nextFollowUpDate && followUpKind(l) !== 'completed') return false;
    if (filters.date && toInputDate(l.nextFollowUpDate) !== filters.date) return false;
    if (filters.kind && followUpKind(l) !== filters.kind) return false;
    return true;
  }), [items, filters.date, filters.kind]);

  const onChange = (patch) => setFilters((f) => ({ ...f, ...patch, page: 'page' in patch ? patch.page : 1 }));
  const onSort = (key) => setFilters((f) => ({ ...f, sortBy: key, order: f.sortBy === key && f.order === 'asc' ? 'desc' : 'asc', page: 1 }));
  const onDelete = async (lead) => {
    if (!window.confirm(`Delete lead "${lead.leadName}"?`)) return;
    try { await deleteLead(lead._id); notify('Lead deleted', 'success'); load(); }
    catch (e) { notify(getErrorMessage(e), 'error'); }
  };
  const arrow = (k) => (filters.sortBy === k ? (filters.order === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Follow-ups</h1>
          <p className={local.desc}>Scheduled follow-ups from your leads. Dates and times come from saved lead records.</p>
        </div>
      </div>
      <div className="card">
        <div className={local.filters}>
          <input className="input" placeholder="Search name…" value={filters.search} onChange={(e) => onChange({ search: e.target.value })} aria-label="Search follow-ups" />
          <select className="input" value={filters.status} onChange={(e) => onChange({ status: e.target.value })} aria-label="Filter by status">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
          <input className="input" type="date" value={filters.date} onChange={(e) => onChange({ date: e.target.value })} aria-label="Filter by follow-up date" />
          <select className="input" value={filters.kind} onChange={(e) => onChange({ kind: e.target.value })} aria-label="Filter by due state">
            {KINDS.map((k) => <option key={k.id} value={k.id}>{k.text}</option>)}
          </select>
          <button className="btn" onClick={() => setFilters({ search: '', status: '', date: '', kind: '', sortBy: 'nextFollowUpDate', order: 'asc', page: 1, limit: 10 })}>Reset</button>
        </div>
        {error && <div className="error-box" role="alert">{error}</div>}
        {loading && !items.length ? <div className="center-msg">Loading follow-ups…</div>
          : !rows.length ? <div className="center-msg">{filters.date || filters.kind ? 'No follow-ups match these filters on this page.' : 'No follow-ups scheduled.'}</div>
          : (
            <div style={{ opacity: loading ? 0.6 : 1 }}>
              <div className={`${styles.tableWrap} ${local.desktopTable}`}>
                <table className={styles.table}>
                  <thead><tr>
                    <th className={styles.sortable} onClick={() => onSort('leadName')}>Lead name{arrow('leadName')}</th>
                    <th>Contact</th>
                    <th className={styles.sortable} onClick={() => onSort('nextFollowUpDate')}>Follow-up date{arrow('nextFollowUpDate')}</th>
                    <th>Time</th>
                    <th className={styles.sortable} onClick={() => onSort('status')}>Status{arrow('status')}</th>
                    <th className={styles.hideSm}>Assigned to</th>
                    <th />
                  </tr></thead>
                  <tbody>
                    {rows.map((l) => (
                      <tr key={l._id}>
                        <td><Link to={`/leads/${l._id}`} className={styles.name}>{l.leadName}</Link></td>
                        <td>{l.contactNumber || '—'}</td>
                        <td className={isOverdue(l.nextFollowUpDate) && followUpKind(l) === 'overdue' ? styles.overdue : ''}>{fmtDate(l.nextFollowUpDate)}</td>
                        <td>{l.nextFollowUpTime || '—'}</td>
                        <td><div className={local.badges}><FollowUpBadge lead={l} /><StatusBadge status={l.status} /></div></td>
                        <td className={styles.hideSm}>{l.assignedTo?.name || '—'}</td>
                        <td><div className={styles.actions}>
                          <Link className="btn btn-sm" to={`/leads/${l._id}`}>View</Link>
                          <Link className="btn btn-sm" to={`/leads/${l._id}/edit`}>Edit</Link>
                          {isAdmin && <button className="btn btn-sm btn-danger" onClick={() => onDelete(l)}>Delete</button>}
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={local.cards}>
                {rows.map((l) => (
                  <div className={local.card} key={l._id}>
                    <div className={local.cardTop}>
                      <Link to={`/leads/${l._id}`} className={styles.name}>{l.leadName}</Link>
                      <FollowUpBadge lead={l} />
                    </div>
                    <p className={local.meta}>{l.contactNumber || '—'} · {fmtDate(l.nextFollowUpDate)} {l.nextFollowUpTime || ''}</p>
                    <p className={local.meta}>{l.assignedTo?.name || 'Unassigned'}</p>
                    <div className={styles.actions}>
                      <Link className="btn btn-sm" to={`/leads/${l._id}`}>View</Link>
                      <Link className="btn btn-sm" to={`/leads/${l._id}/edit`}>Edit</Link>
                      {isAdmin && <button className="btn btn-sm btn-danger" onClick={() => onDelete(l)}>Delete</button>}
                    </div>
                  </div>
                ))}
              </div>
              <Pagination pagination={pagination} onPage={(page) => onChange({ page })} noun="follow-up" />
            </div>
          )}
      </div>
    </>
  );
}
