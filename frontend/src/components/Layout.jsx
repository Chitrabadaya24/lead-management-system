import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLeads } from '../context/LeadsContext';
import useReminders from '../hooks/useReminders';
import ProfileModal from './ProfileModal';
import styles from './Layout.module.css';

const SIDEBAR_KEY = 'lms_sidebar';

function IconDash() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4V4zm9 0h7v10h-7V4zM4 13h7v7H4v-7zm9 4h7v3h-7v-3z" /></svg>;
}
function IconLeads() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z" /></svg>;
}
function IconFollow() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" /></svg>;
}
function IconCustomers() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>;
}
function IconSettings() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a7.03 7.03 0 00-1.63-.94l-.36-2.54A.49.49 0 0014.3 2h-4.6a.49.49 0 00-.49.42l-.36 2.54c-.59.24-1.13.55-1.63.94l-2.39-.96a.5.5 0 00-.6.22L2.31 8.48a.5.5 0 00.12.64L4.46 10.7c-.04.31-.06.63-.06.94s.02.63.06.94L2.43 14.16a.5.5 0 00-.12.64l1.92 3.32c.13.23.4.32.64.22l2.39-.96c.5.39 1.04.7 1.63.94l.36 2.54c.05.24.25.42.49.42h4.6c.24 0 .44-.18.49-.42l.36-2.54c.59-.24 1.13-.55 1.63-.94l2.39.96c.24.1.51.01.64-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z" /></svg>;
}
function IconLogout() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l1.4-1.4L8.8 13H19v-2H8.8l2.6-2.6L10 7l-5 5 5 5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" /></svg>;
}

function headerCopy(pathname, status, firstName) {
  if (pathname === '/') return { title: `Hello, ${firstName}` };
  if (pathname === '/follow-ups') return { title: 'Follow-ups', sub: 'Upcoming, due, and overdue follow-ups' };
  if (pathname === '/leads/new') return { title: 'New lead', sub: 'Create a lead record' };
  if (pathname.endsWith('/edit')) return { title: 'Edit lead', sub: 'Update lead details' };
  if (pathname === '/leads' && status === 'follow-up') return { title: 'Follow-ups', sub: 'Leads in follow-up' };
  if (pathname === '/leads' && status === 'converted') return { title: 'Customers', sub: 'Converted leads & customers' };
  if (pathname === '/leads') return { title: 'Leads', sub: 'Search, filter and manage leads' };
  if (pathname.startsWith('/leads/')) return { title: 'Lead details', sub: 'View lead and customer information' };
  return { title: 'PharmaLeads', sub: '' };
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { reminders } = useLeads();
  const navigate = useNavigate();
  const location = useLocation();
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === '1');
  useReminders();

  const toggleSide = () => setCollapsed((c) => {
    const next = !c;
    localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
    return next;
  });
  const initial = (user.name || 'U').trim().charAt(0).toUpperCase();
  const status = new URLSearchParams(location.search).get('status') || '';
  const firstName = (user.name || 'there').split(' ')[0];
  const { title, sub } = headerCopy(location.pathname, status, firstName);
  const leadsActive = (want) => location.pathname === '/leads' && status === want;
  const navCls = (on) => `${styles.link} ${on ? styles.active : ''}`;
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.shell}>
      <aside className={`${styles.side} ${collapsed ? styles.collapsed : ''} ${menuOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.brand}>
          <button
            type="button"
            className={styles.logo}
            onClick={toggleSide}
            data-tip={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            Rx
          </button>
          <span className={styles.brandText}>PharmaLeads</span>
        </div>
        <NavLink to="/" end className={({ isActive }) => navCls(isActive)} data-tip="Dashboard" title="Dashboard" onClick={closeMenu}>
          <IconDash /><span className={styles.label}>Dashboard</span>
        </NavLink>
        <NavLink to="/leads" end className={() => navCls(leadsActive(''))} data-tip="Leads" title="Leads" onClick={closeMenu}>
          <IconLeads /><span className={styles.label}>Leads</span>
        </NavLink>
        <NavLink to="/follow-ups" className={({ isActive }) => navCls(isActive)} data-tip="Follow-ups" title="Follow-ups" onClick={closeMenu}>
          <IconFollow /><span className={styles.label}>Follow-ups</span>
        </NavLink>
        <NavLink to="/leads?status=converted" className={() => navCls(leadsActive('converted'))} data-tip="Customers" title="Customers" onClick={closeMenu}>
          <IconCustomers /><span className={styles.label}>Customers</span>
        </NavLink>
        {/* <button type="button" className={navCls(editing)} data-tip="Settings" title="Settings" onClick={() => { setEditing(true); closeMenu(); }}>
          <IconSettings /><span className={styles.label}>Settings</span>
        </button> */}
        <div className={styles.account}>
          <button
            className={`btn btn-sm ${styles.logout}`}
            onClick={() => { logout(); navigate('/login'); }}
            data-tip="Logout"
            title="Logout"
            aria-label="Logout"
          >
            <IconLogout />
            <span className={styles.label}>Logout</span>
          </button>
        </div>
      </aside>
      <div className={styles.main}>
        <header className={styles.top}>
          <button type="button" className={styles.menuBtn} onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle navigation" title="Menu">☰</button>
          <div className={styles.greet}>
            <h1>{title}</h1>
            {sub && <p>{sub}</p>}
          </div>
          <div className={styles.topActions}>
            <button
              className={styles.bell}
              onClick={() => navigate('/follow-ups')}
              aria-label="Follow-up reminders"
              data-tip="Follow-up reminders"
              title="Follow-up reminders"
            >
              🔔{reminders.length > 0 && <span className={styles.badge}>{reminders.length}</span>}
            </button>
            <button type="button" className={styles.headerWho} onClick={() => setEditing(true)} title="Edit profile" data-tip="Edit profile">
              <span className={styles.avatar}>{initial}</span>
              <span className={styles.headerWhoText}><strong>{user.name}</strong><small>{user.role}</small></span>
            </button>
          </div>
        </header>
        <main className={styles.content}><Outlet /></main>
      </div>
      {editing && <ProfileModal onClose={() => setEditing(false)} />}
    </div>
  );
}
