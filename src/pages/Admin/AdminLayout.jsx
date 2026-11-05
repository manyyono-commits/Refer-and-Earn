import { Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaExternalLinkAlt, FaList, FaNewspaper, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import Seo from '../../components/common/Seo';
import Loader from '../../components/common/Loader';
import ScrollToTop from '../../components/layout/ScrollToTop';
import { logout } from '../../features/admin/adminSlice';
import styles from './Admin.module.css';

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login', { replace: true });
  };

  const navClass = ({ isActive }) => `${styles.topNavItem} ${isActive ? styles.topNavActive : ''}`;

  return (
    <div className={styles.shell}>
      <Seo title="Admin" noindex />
      <ScrollToTop />
      <header className={styles.topBar}>
        <Link to="/admin" className={styles.brand}>
          <img src="/images/logo.jpeg" alt="" width="32" height="32" />
          <span>Admin Panel</span>
        </Link>
        <nav className={styles.topNav}>
          <NavLink to="/admin" end className={navClass}>
            <FaList aria-hidden="true" /> <span>Listings</span>
          </NavLink>
          <NavLink to="/admin/apps/new" className={navClass}>
            <FaPlus aria-hidden="true" /> <span>Add App</span>
          </NavLink>
          <NavLink to="/admin/posts" className={navClass}>
            <FaNewspaper aria-hidden="true" /> <span>Blog Posts</span>
          </NavLink>
          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.topNavItem}>
            <FaExternalLinkAlt aria-hidden="true" /> <span>View Site</span>
          </a>
          <button type="button" className={styles.topNavItem} onClick={handleLogout}>
            <FaSignOutAlt aria-hidden="true" /> <span>Log out</span>
          </button>
        </nav>
      </header>
      <main className={styles.content}>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
