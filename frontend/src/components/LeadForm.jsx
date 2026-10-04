import { useCallback, useState } from 'react';
import { CUSTOMER_TYPES, SOURCES, STATUSES } from '../constants';
import { label, toInputDate } from '../utils/format';
import styles from './Form.module.css';

const EMPTY = { leadName: '', contactNumber: '', email: '', address: '', status: 'new', assignedTo: '', leadSource: 'walk-in', nextFollowUpDate: '', nextFollowUpTime: '', leadNotes: '', conversionDate: '', customerType: 'new', purchaseHistory: [], medicalNeeds: '' };

export const toFormValues = (l) => !l ? EMPTY : {
  ...EMPTY, ...l, assignedTo: l.assignedTo?._id || '', email: l.email || '', address: l.address || '', leadNotes: l.leadNotes || '', medicalNeeds: l.medicalNeeds || '', nextFollowUpTime: l.nextFollowUpTime || '',
  nextFollowUpDate: toInputDate(l.nextFollowUpDate), conversionDate: toInputDate(l.conversionDate),
  purchaseHistory: (l.purchaseHistory || []).map((p) => ({ ...p, date: toInputDate(p.date) })),
};

export function validate(v) {
  const e = {};
  if (!v.leadName.trim()) e.leadName = 'Lead name is required';
  if (!v.contactNumber.trim()) e.contactNumber = 'Contact number is required';
  else if (!/^[0-9+\-\s]{7,15}$/.test(v.contactNumber.trim())) e.contactNumber = 'Enter a valid phone number (7-15 digits)';
  if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email';
  if (v.status === 'follow-up' && !v.nextFollowUpDate) e.nextFollowUpDate = 'Follow-up date is required for this status';
  v.purchaseHistory.forEach((p, i) => { if (!p.item.trim()) e[`purchaseHistory.${i}.item`] = 'Item required'; });
  return e;
}

function Field({ k, text, full, error, children }) {
  return (
    <div className={`${styles.field} ${full ? styles.full : ''}`}>
      <label htmlFor={k}>{text}</label>
      {children}{error && <span className={styles.err}>{error}</span>}
    </div>
  );
}

export default function LeadForm({ initial, users, isAdmin, submitting, serverErrors = {}, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(initial));
  const [errors, setErrors] = useState({});
  const set = useCallback((k, val) => setValues((v) => ({ ...v, [k]: val })), []);
  const bind = (k) => ({ className: 'input', value: values[k], onChange: (e) => set(k, e.target.value) });
  const err = (k) => errors[k] || serverErrors[k];
  const converted = values.status === 'converted';

  const submit = (ev) => {
    ev.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    const { assignedTo, conversionDate, customerType, purchaseHistory, medicalNeeds, ...rest } = values;
    const payload = { ...rest, ...(assignedTo && { assignedTo }) };
    if (converted) Object.assign(payload, { conversionDate, customerType, medicalNeeds, purchaseHistory: purchaseHistory.map((p) => ({ ...p, amount: Number(p.amount) || 0 })) });
    onSubmit(payload);
  };
  const setPurchase = (i, k, val) => set('purchaseHistory', values.purchaseHistory.map((p, idx) => (idx === i ? { ...p, [k]: val } : p)));

  return (
    <form onSubmit={submit} noValidate className="card">
      <div className={styles.grid}>
        <Field k="leadName" error={err('leadName')} text="Lead name *"><input id="leadName" {...bind('leadName')} /></Field>
        <Field k="contactNumber" error={err('contactNumber')} text="Contact number *"><input id="contactNumber" {...bind('contactNumber')} /></Field>
        <Field k="email" error={err('email')} text="Email"><input id="email" type="email" {...bind('email')} /></Field>
        <Field k="leadSource" error={err('leadSource')} text="Lead source"><select id="leadSource" {...bind('leadSource')}>{SOURCES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></Field>
        <Field k="address" error={err('address')} text="Address" full><input id="address" {...bind('address')} /></Field>
        <Field k="status" error={err('status')} text="Status"><select id="status" {...bind('status')}>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></Field>
        {isAdmin && <Field k="assignedTo" error={err('assignedTo')} text="Assigned to"><select id="assignedTo" {...bind('assignedTo')}><option value="">Me</option>{users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}</select></Field>}
        <Field k="nextFollowUpDate" error={err('nextFollowUpDate')} text="Next follow-up date"><input id="nextFollowUpDate" type="date" {...bind('nextFollowUpDate')} /></Field>
        <Field k="nextFollowUpTime" error={err('nextFollowUpTime')} text="Next follow-up time"><input id="nextFollowUpTime" type="time" {...bind('nextFollowUpTime')} /></Field>
        <Field k="leadNotes" error={err('leadNotes')} text="Notes" full><textarea id="leadNotes" rows={3} {...bind('leadNotes')} /></Field>
      </div>

      {converted && (
        <>
          <div className={styles.section}>Customer details</div>
          <div className={styles.grid}>
            <Field k="conversionDate" error={err('conversionDate')} text="Conversion date"><input id="conversionDate" type="date" {...bind('conversionDate')} /></Field>
            <Field k="customerType" error={err('customerType')} text="Customer type"><select id="customerType" {...bind('customerType')}>{CUSTOMER_TYPES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></Field>
            <Field k="medicalNeeds" error={err('medicalNeeds')} text="Medical needs" full><textarea id="medicalNeeds" rows={2} {...bind('medicalNeeds')} /></Field>
          </div>
          <div className={styles.section}>Purchase history</div>
          {values.purchaseHistory.map((p, i) => (
            <div className={styles.row} key={i}>
              <div><input className="input" placeholder="Item" aria-label={`Item ${i + 1}`} value={p.item} onChange={(e) => setPurchase(i, 'item', e.target.value)} />{err(`purchaseHistory.${i}.item`) && <span className={styles.err}>{err(`purchaseHistory.${i}.item`)}</span>}</div>
              <input className="input" type="number" min="0" placeholder="Amount" aria-label={`Amount ${i + 1}`} value={p.amount ?? ''} onChange={(e) => setPurchase(i, 'amount', e.target.value)} />
              <input className="input" type="date" aria-label={`Date ${i + 1}`} value={p.date || ''} onChange={(e) => setPurchase(i, 'date', e.target.value)} />
              <button type="button" className="btn btn-sm btn-danger" onClick={() => set('purchaseHistory', values.purchaseHistory.filter((_, x) => x !== i))}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-sm" onClick={() => set('purchaseHistory', [...values.purchaseHistory, { item: '', amount: '', date: toInputDate(new Date()) }])}>+ Add purchase</button>
        </>
      )}

      <div className={styles.footer}>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save lead'}</button>
      </div>
    </form>
  );
}
