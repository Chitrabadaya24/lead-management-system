import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { useLeads } from '../context/LeadsContext';
import { leadService } from '../services/api';
import { fmtDate, isOverdue } from '../utils/format';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { reminders } = useLeads();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);

  useEffect(() => {
    leadService.stats().then((r) => setStats(r.data)).catch(() => setStats({ total: 0, byStatus: {}, conversionRate: 0 }));
    leadService.list({ sortBy: 'createdAt', order: 'desc', page: 1, limit: 5 })
      .then((r) => setRecent(r.data || []))
      .catch(() => setRecent([]));
  }, [reminders.length]);

  const count = (k) => stats?.byStatus?.[k] || 0;

  return (
    <>
      <div className="page-head"><Link className="btn btn-primary" to="/leads/new" style={{ marginLeft: 'auto' }}>+ New Lead</Link></div>
      {!stats ? <div className="center-msg">Loading…</div> : (
        <>
          <div className={styles.stats}>
            <Link to="/leads" className={`card ${styles.stat} ${styles.accent}`}><span>Total leads</span><strong>{stats.total}</strong></Link>
            <Link to="/leads?status=new" className={`card ${styles.stat} ${styles.accent}`}><span>New leads</span><strong>{count('new')}</strong></Link>
            <Link to="/follow-ups" className={`card ${styles.stat} ${styles.accent}`}><span>Follow-ups</span><strong>{count('follow-up')}</strong></Link>
            <Link to="/leads?status=converted" className={`card ${styles.stat} ${styles.accent}`}><span>Customers</span><strong>{count('converted')}</strong></Link>
          </div>
          <div className={styles.statsMore}>
            <div className={`card ${styles.stat}`}><span>Contacted</span><strong>{count('contacted')}</strong></div>
            <div className={`card ${styles.stat}`}><span>Lost</span><strong>{count('lost')}</strong></div>
            <div className={`card ${styles.stat}`}><span>Conversion</span><strong>{stats.conversionRate}%</strong></div>
          </div>
        </>
      )}
      <div className={styles.columns}>
        <div className="card">
          <div className={styles.cardHead}>
            <h3>Upcoming follow-ups</h3>
            <Link to="/follow-ups">View all</Link>
          </div>
          {reminders.length === 0 ? <p className={styles.empty}>No follow-ups due today or tomorrow.</p> : reminders.map((l) => (
            <Link to={`/leads/${l._id}`} className={styles.row} key={l._id}>
              <div>
                <strong>{l.leadName}</strong>
                <span className={styles.meta}>{l.assignedTo?.name || 'Unassigned'}</span>
              </div>
              <StatusBadge status={l.status} />
              <div className={`${styles.when} ${isOverdue(l.nextFollowUpDate) ? styles.late : ''}`}>
                <span>{isOverdue(l.nextFollowUpDate) ? 'Overdue · ' : ''}{fmtDate(l.nextFollowUpDate)}</span>
                <span>{l.nextFollowUpTime || '—'}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="card">
          <div className={styles.cardHead}>
            <h3>Recent leads</h3>
            <Link to="/leads">View all</Link>
          </div>
          {recent === null ? <p className={styles.empty}>Loading…</p>
            : recent.length === 0 ? <p className={styles.empty}>No leads yet.</p>
            : recent.map((l) => (
              <Link to={`/leads/${l._id}`} className={styles.row} key={l._id}>
                <div>
                  <strong>{l.leadName}</strong>
                  <span className={styles.meta}>{l.contactNumber}</span>
                </div>
                <StatusBadge status={l.status} />
                <div className={styles.when}>
                  <span>{fmtDate(l.createdAt)}</span>
                  <span>{l.assignedTo?.name || '—'}</span>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </>
  );
}
