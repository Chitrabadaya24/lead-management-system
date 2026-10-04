import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import FollowUps from './views/FollowUps';
import Leads from './views/Leads';

const LeadEdit = lazy(() => import('./views/LeadEdit'));
const LeadView = lazy(() => import('./views/LeadView'));

export default function App() {
  return (
    <Suspense fallback={<div className="center-msg">Loading…</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login register />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/leads/new" element={<LeadEdit />} />
          <Route path="/leads/:id" element={<LeadView />} />
          <Route path="/leads/:id/edit" element={<LeadEdit />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
