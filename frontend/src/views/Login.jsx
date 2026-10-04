import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import styles from '../components/Form.module.css';

export default function Login({ register = false }) {
  const { user, login, register: signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({name: '',email: '',password: '',role: 'user'});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={location.state?.from?.pathname || '/'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await (register ? signUp(form) : login({ email: form.email, password: form.password }));
      navigate('/');
    } catch (err) { setError(getErrorMessage(err)); } finally { setBusy(false); }
  };
  const bind = (k) => ({ className: 'input', value: form[k], onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })), required: true });

  return (
    <div className={styles.auth}>
      <form className={`card ${styles.authCard}`} onSubmit={submit}>
        <h1>{register ? 'Create account' : 'Welcome back'}</h1>
        <p className={styles.hint}>PharmaLeads · Lead management</p>
        {error && <div className="error-box" role="alert">{error}</div>}
        {register && <div className={styles.field} style={{ marginBottom: 12 }}>
          <label htmlFor="name">Name</label>
          <input id="name" {...bind('name')} />
          </div>}
        {register && (
                  <div className={styles.field} style={{ marginBottom: 12 }}>
                    <label htmlFor="role">Role</label>
                    <select id="role" {...bind('role')}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}
        <div className={styles.field} style={{ marginBottom: 12 }}><label htmlFor="email">Email</label><input id="email" type="email" {...bind('email')} /></div>
        <div className={styles.field} style={{ marginBottom: 18 }}><label htmlFor="password">Password</label><input id="password" type="password" minLength={register ? 6 : undefined} {...bind('password')} /></div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Please wait…' : register ? 'Sign up' : 'Sign in'}</button>
        <p style={{ textAlign: 'center' }}>{register ? <Link to="/login">Have an account? Sign in</Link> : <Link to="/register">New here? Create account</Link>}</p>
        {/* {!register && <div className={styles.demo}>Demo: admin@pharmacy.com / Admin@123<br />user@pharmacy.com / User@123</div>} */}
      </form>
    </div>
  );
}
