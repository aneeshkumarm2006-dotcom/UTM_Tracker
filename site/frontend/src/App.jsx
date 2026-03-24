import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Toast from '@/components/Toast';
import ProtectedRoute from '@/components/ProtectedRoute';

// Public pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

// Dashboard pages (protected)
import Overview from '@/pages/dashboard/Overview';
import Configure from '@/pages/dashboard/Configure';
import Snippet from '@/pages/dashboard/Snippet';
import ApiKey from '@/pages/dashboard/ApiKey';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected Routes ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* /dashboard → redirect to /dashboard (Overview) */}
            <Route path="/dashboard" element={<Overview />} />
            <Route path="/dashboard/configure" element={<Configure />} />
            <Route path="/dashboard/snippet" element={<Snippet />} />
            <Route path="/dashboard/apikey" element={<ApiKey />} />
          </Route>
        </Route>

        {/* Catch-all → redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </BrowserRouter>
  );
}

