import { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaBars, FaTimes, FaTelegramPlane } from 'react-icons/fa';
import { closeMobileMenu, selectMobileMenuOpen, toggleMobileMenu } from '../../features/ui/uiSlice';
import { useGetSiteContentQuery } from '../../services/api';
import styles from './Header.module.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/disclaimer', label: 'Disclaimer' },
];

export default function Header() {
  const dispatch = useDispatch();
  const menuOpen = useSelector(selectMobileMenuOpen);
  const { pathname } = useLocation();
  const { data: site } = useGetSiteContentQuery();

  useEffect(() => {
    dispatch(closeMobileMenu());
  }, [pathname, dispatch]);

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand} aria-label="Go to home page">
        <img src="/images/logo.jpeg" alt="" className={styles.logo} width="40" height="40" />
        <span className={styles.siteTitle}>{site?.siteName ?? 'All New Apps'}</span>
      </Link>

      <button
        type="button"
        className={styles.menuToggle}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="primary-nav"
        onClick={() => dispatch(toggleMobileMenu())}
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <nav id="primary-nav" className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
        <ul className={styles.navMenu}>
          {NAV_LINKS.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                {label}
              </NavLink>
            </li>
          ))}
          {site?.telegramUrl && (
            <li>
              <a
                href={site.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.navItem} ${styles.telegram}`}
              >
                <FaTelegramPlane /> TG Join
              </a>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
