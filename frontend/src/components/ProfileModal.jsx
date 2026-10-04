import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getFieldErrors } from '../services/api';
import form from './Form.module.css';
import styles from './ProfileModal.module.css';

export default function ProfileModal({ onClose }) {
  const { user, updateProfile } = useAuth();
  const { notify } = useToast();
  const [formState, setFormState] = useState({ name: user.name, email: user.email, currentPassword: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const bind = (k) => ({ className: 'input', value: formState[k], onChange: (e) => setFormState((f) => ({ ...f, [k]: e.target.value })) });

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (formState.password && !formState.currentPassword) {
      setFieldErrors({ currentPassword: 'Enter your current password to change it' });
      return;
    }
    setBusy(true);
    try {
      const body = { name: formState.name, email: formState.email };
      if (formState.password) {
        body.password = formState.password;
        body.currentPassword = formState.currentPassword;
      }
      await updateProfile(body);
      notify('Profile updated', 'success');
      onClose();
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
    } finally { setBusy(false); }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <form className={`card ${styles.panel}`} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Your login details</h2>
        <p className={form.hint}>Update your name, email, or password.</p>
        {error && <div className="error-box" role="alert">{error}</div>}
        <div className={form.field} style={{ marginBottom: 12 }}>
          <label htmlFor="profile-name">Name</label>
          <input id="profile-name" {...bind('name')} required minLength={2} />
          {fieldErrors.name && <span className={form.err}>{fieldErrors.name}</span>}
        </div>
        <div className={form.field} style={{ marginBottom: 12 }}>
          <label htmlFor="profile-email">Email</label>
          <input id="profile-email" type="email" {...bind('email')} required />
          {fieldErrors.email && <span className={form.err}>{fieldErrors.email}</span>}
        </div>
        <div className={form.field} style={{ marginBottom: 12 }}>
          <label htmlFor="profile-current">Current password</label>
          <input id="profile-current" type="password" {...bind('currentPassword')} autoComplete="current-password" />
          {fieldErrors.currentPassword && <span className={form.err}>{fieldErrors.currentPassword}</span>}
        </div>
        <div className={form.field} style={{ marginBottom: 18 }}>
          <label htmlFor="profile-new">New password</label>
          <input id="profile-new" type="password" minLength={6} {...bind('password')} autoComplete="new-password" placeholder="Leave blank to keep current" />
          {fieldErrors.password && <span className={form.err}>{fieldErrors.password}</span>}
        </div>
        <div className={form.footer} style={{ marginTop: 0 }}>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  );
}
