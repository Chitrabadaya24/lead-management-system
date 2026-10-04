import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LeadForm from '../components/LeadForm';
import { useAuth } from '../context/AuthContext';
import { useLeads } from '../context/LeadsContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getFieldErrors, leadService, userService } from '../services/api';

export default function LeadEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { createLead, updateLead } = useLeads();
  const { notify } = useToast();
  const [lead, setLead] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  useEffect(() => { userService.list().then((r) => setUsers(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    if (!id) return;
    leadService.get(id).then((r) => setLead(r.data)).catch((e) => { notify(getErrorMessage(e), 'error'); navigate('/leads'); }).finally(() => setLoading(false));
  }, [id, navigate, notify]);

  const handleSubmit = async (payload) => {
    setSubmitting(true); setServerErrors({});
    try {
      const res = id ? await updateLead(id, payload) : await createLead(payload);
      notify(id ? 'Lead updated' : 'Lead created', 'success');
      navigate(`/leads/${res.data._id}`);
    } catch (e) { setServerErrors(getFieldErrors(e)); notify(getErrorMessage(e), 'error'); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="center-msg">Loading…</div>;
  return (
    <LeadForm initial={lead} users={users} isAdmin={isAdmin} submitting={submitting} serverErrors={serverErrors} onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
  );
}
