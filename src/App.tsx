import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import LoginPage    from './pages/LoginPage';
import AdminLayout  from './pages/admin/AdminLayout';
import ClientLayout from './pages/client/ClientLayout';

function ProtectedAdmin() {
  const { role } = useAuth();
  if (role !== 'admin') return <Navigate to="/login" replace />;
  return <AdminLayout />;
}

function ProtectedClient() {
  const { role } = useAuth();
  if (role !== 'client') return <Navigate to="/login" replace />;
  return <ClientLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<Navigate to="/login" replace />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/admin/*"  element={<ProtectedAdmin />} />
      <Route path="/client/*" element={<ProtectedClient />} />
      <Route path="*"         element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
