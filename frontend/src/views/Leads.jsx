import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LeadFilters from '../components/LeadFilters';
import LeadTable from '../components/LeadTable';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { useLeads } from '../context/LeadsContext';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import { getErrorMessage, userService } from '../services/api';

const DEFAULTS = { search: '', status: '', leadSource: '', assignedTo: '', sortBy: 'createdAt', order: 'desc', page: 1, limit: 10 };

export default function Leads() {
  const { isAdmin } = useAuth();
  const { items, pagination, loading, error, fetchLeads, deleteLead } = useLeads();
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get('status') || '';
  const [filters, setFilters] = useState(() => ({ ...DEFAULTS, status: urlStatus }));
  const [users, setUsers] = useState([]);
  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    setFilters((f) => (f.status === urlStatus ? f : { ...f, status: urlStatus, page: 1 }));
  }, [urlStatus]);

  useEffect(() => { userService.list().then((r) => setUsers(r.data)).catch(() => {}); }, []);
  const params = useMemo(
    () => Object.fromEntries(Object.entries({ ...filters, search: debouncedSearch }).filter(([, v]) => v !== '')),
    [filters, debouncedSearch]
  );
  useEffect(() => { fetchLeads(params); }, [fetchLeads, params]);

  const onChange = useCallback((patch) => {
    setFilters((f) => ({ ...f, ...patch, page: 1 }));
    if ('status' in patch) {
      const next = new URLSearchParams(searchParams);
      if (patch.status) next.set('status', patch.status); else next.delete('status');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  const onReset = useCallback(() => { setFilters(DEFAULTS); setSearchParams({}, { replace: true }); }, [setSearchParams]);
  const onPage = useCallback((page) => setFilters((f) => ({ ...f, page })), []);
  const onSort = useCallback((key) => setFilters((f) => ({ ...f, sortBy: key, order: f.sortBy === key && f.order === 'asc' ? 'desc' : 'asc', page: 1 })), []);
  const onDelete = useCallback(async (lead) => {
    if (!window.confirm(`Delete lead "${lead.leadName}"?`)) return;
    try { await deleteLead(lead._id); notify('Lead deleted', 'success'); fetchLeads(params); } catch (e) { notify(getErrorMessage(e), 'error'); }
  }, [deleteLead, fetchLeads, notify, params]);

  return (
    <>
      <div className="page-head"><h1>Leads</h1><Link className="btn btn-primary" to="/leads/new">+ New Lead</Link></div>
      <div className="card">
        <LeadFilters filters={filters} users={users} onChange={onChange} onReset={onReset} />
        {error && <div className="error-box">{error}</div>}
        {loading && !items.length ? <div className="center-msg">Loading leads…</div>
          : !items.length ? <div className="center-msg">No leads match your filters.</div>
          : <div style={{ opacity: loading ? 0.6 : 1 }}><LeadTable leads={items} sortBy={filters.sortBy} order={filters.order} onSort={onSort} onDelete={onDelete} canDelete={isAdmin} /><Pagination pagination={pagination} onPage={onPage} /></div>}
      </div>
    </>
  );
}
