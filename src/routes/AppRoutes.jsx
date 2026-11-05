import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LEGACY_REDIRECTS } from '../../shared/seo/pages';
import Layout from '../components/layout/Layout';
import Loader from '../components/common/Loader';

const Home = lazy(() => import('../pages/Home/Home'));
const About = lazy(() => import('../pages/About/About'));
const Contact = lazy(() => import('../pages/Contact/Contact'));
const Disclaimer = lazy(() => import('../pages/Disclaimer/Disclaimer'));
const BlogList = lazy(() => import('../pages/Blog/BlogList'));
const BlogPost = lazy(() => import('../pages/Blog/BlogPost'));
const AppDetail = lazy(() => import('../pages/AppDetail/AppDetail'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound'));

// Admin code is split into its own chunks, so visitors never download it.
const RequireAdmin = lazy(() => import('../pages/Admin/RequireAdmin'));
const AdminLayout = lazy(() => import('../pages/Admin/AdminLayout'));
const AdminLogin = lazy(() => import('../pages/Admin/Login/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard/AdminDashboard'));
const AppFormPage = lazy(() => import('../pages/Admin/AppForm/AppFormPage'));
const AdminPosts = lazy(() => import('../pages/Admin/Posts/AdminPosts'));
const PostFormPage = lazy(() => import('../pages/Admin/Posts/PostFormPage'));

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
          <Route path="posts" element={<AdminPosts />} />
          <Route path="posts/new" element={<PostFormPage />} />
          <Route path="posts/:id/edit" element={<PostFormPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="disclaimer" element={<Disclaimer />} />
          {/* Old article URLs now live in the blog (the server sends 301s for crawlers). */}
          {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
            <Route key={from} path={from.replace(/^\/|\/$/g, '')} element={<Navigate to={to} replace />} />
          ))}
          <Route path="blog" element={<BlogList />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          {/* App pages live at the root, e.g. /lotus-rummy, mirroring the reference URL scheme. */}
          <Route path=":slug" element={<AppDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
