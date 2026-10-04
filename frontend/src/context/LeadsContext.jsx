import { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState } from 'react';
import { leadService, getErrorMessage } from '../services/api';

const LeadsContext = createContext(null);
export const useLeads = () => useContext(LeadsContext);

const initial = { items: [], pagination: { page: 1, pages: 1, total: 0, limit: 10 }, loading: false, error: null };
function reducer(state, a) {
  switch (a.type) {
    case 'loading': return { ...state, loading: true, error: null };
    case 'loaded': return { items: a.payload.data, pagination: a.payload.pagination, loading: false, error: null };
    case 'error': return { ...state, loading: false, error: a.payload };
    default: return state;
  }
}

export function LeadsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [reminders, setReminders] = useState([]);
  const cache = useRef(new Map()); // local cache keyed by query; cleared on any mutation
  const reqId = useRef(0);

  const fetchLeads = useCallback(async (params) => {
    const key = JSON.stringify(params);
    if (cache.current.has(key)) return dispatch({ type: 'loaded', payload: cache.current.get(key) });
    const id = ++reqId.current;
    dispatch({ type: 'loading' });
    try {
      const res = await leadService.list(params);
      cache.current.set(key, res);
      if (id === reqId.current) dispatch({ type: 'loaded', payload: res });
    } catch (e) {
      if (id === reqId.current) dispatch({ type: 'error', payload: getErrorMessage(e) });
    }
  }, []);

  const fetchReminders = useCallback(async () => {
    try { setReminders((await leadService.reminders()).data); } catch { /* non-critical */ }
  }, []);

  const mutate = useCallback((fn) => async (...args) => {
    const result = await fn(...args);
    cache.current.clear();
    fetchReminders();
    return result;
  }, [fetchReminders]);

  const value = useMemo(() => ({
    ...state, reminders, fetchLeads, fetchReminders,
    createLead: mutate(leadService.create), updateLead: mutate(leadService.update), deleteLead: mutate(leadService.remove),
  }), [state, reminders, fetchLeads, fetchReminders, mutate]);
  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}
