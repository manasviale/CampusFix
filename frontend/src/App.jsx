import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ComplaintBoard from './pages/ComplaintBoard';
import ComplaintDetail from './pages/ComplaintDetail';
import ProfilePage from './pages/ProfilePage';
import CreateComplaint from './pages/CreateComplaint';
import AIInsights from './pages/AIInsights';
import VolunteerManagement from './pages/VolunteerManagement';
import AdminPanel from './pages/AdminPanel';

function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/complaints" element={<ComplaintBoard />} />
          <Route path="/complaints/:id" element={<ComplaintDetail />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['volunteer', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/complaints/new" element={<CreateComplaint />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['faculty', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/insights" element={<AIInsights />} />
          <Route path="/volunteers" element={<VolunteerManagement />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
