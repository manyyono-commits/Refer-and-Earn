import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Loader from '../components/common/Loader';

const Home = lazy(() => import('../pages/Home/Home'));
const About = lazy(() => import('../pages/About/About'));
const Contact = lazy(() => import('../pages/Contact/Contact'));
const Disclaimer = lazy(() => import('../pages/Disclaimer/Disclaimer'));
const AppDetail = lazy(() => import('../pages/AppDetail/AppDetail'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound'));

// Admin code is split into its own chunks, so visitors never download it.
const RequireAdmin = lazy(() => import('../pages/Admin/RequireAdmin'));
const AdminLayout = lazy(() => import('../pages/Admin/AdminLayout'));
const AdminLogin = lazy(() => import('../pages/Admin/Login/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard/AdminDashboard'));
const AppFormPage = lazy(() => import('../pages/Admin/AppForm/AppFormPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="admin/login" element={<AdminLogin />} />
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="apps/new" element={<AppFormPage />} />
          <Route path="apps/:id/edit" element={<AppFormPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="disclaimer" element={<Disclaimer />} />
          {/* App pages live at the root, e.g. /lotus-rummy, mirroring the reference URL scheme. */}
          <Route path=":slug" element={<AppDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
