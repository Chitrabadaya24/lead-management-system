import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useLeads } from '../context/LeadsContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, leadService } from '../services/api';
import { fmtDate, label } from '../utils/format';
import styles from './Dashboard.module.css';

export default function LeadView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { deleteLead } = useLeads();
  const { notify } = useToast();
  const [lead, setLead] = useState(null);

  useEffect(() => { leadService.get(id).then((r) => setLead(r.data)).catch((e) => { notify(getErrorMessage(e), 'error'); navigate('/leads'); }); }, [id, navigate, notify]);
  if (!lead) return <div className="center-msg">Loading…</div>;

  const remove = async () => {
    if (!window.confirm('Delete this lead?')) return;
    try { await deleteLead(id); notify('Lead deleted', 'success'); navigate('/leads'); } catch (e) { notify(getErrorMessage(e), 'error'); }
  };
  const D = ({ t, children }) => <div><dt>{t}</dt><dd>{children || '—'}</dd></div>;

  return (
    <>
      <div className="page-head">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><h1>{lead.leadName}</h1><StatusBadge status={lead.status} /></div>
        <div style={{ display: 'flex', gap: 8 }}><Link className="btn" to="/leads">Back</Link><Link className="btn btn-primary" to={`/leads/${id}/edit`}>Edit</Link>{isAdmin && <button className="btn btn-danger" onClick={remove}>Delete</button>}</div>
      </div>
      <div className="card">
        <dl className={styles.detail}>
          <D t="Contact">{lead.contactNumber}</D><D t="Email">{lead.email}</D>
          <D t="Address">{lead.address}</D><D t="Lead source">{label(lead.leadSource)}</D>
          <D t="Assigned to">{lead.assignedTo?.name}</D><D t="Next follow-up">{lead.nextFollowUpDate && `${fmtDate(lead.nextFollowUpDate)} ${lead.nextFollowUpTime || ''}`}</D>
          <D t="Notes">{lead.leadNotes}</D>
          {lead.status === 'converted' && <>
            <D t="Conversion date">{fmtDate(lead.conversionDate)}</D><D t="Customer type">{label(lead.customerType)}</D><D t="Medical needs">{lead.medicalNeeds}</D>
          </>}
        </dl>
        {lead.status === 'converted' && lead.purchaseHistory?.length > 0 && (
          <>
            <h3 style={{ margin: '22px 0 8px' }}>Purchase history</h3>
            {lead.purchaseHistory.map((p, i) => <div className={styles.item} key={i}><span>{p.item}</span><span>₹{p.amount} · {fmtDate(p.date)}</span></div>)}
          </>
        )}
      </div>
    </>
  );
}
