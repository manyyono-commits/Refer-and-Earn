import { Link, NavLink } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaEnvelope, FaExclamationTriangle, FaNewspaper, FaTelegramPlane } from 'react-icons/fa';
import { useGetSiteContentQuery } from '../../services/api';
import styles from './Header.module.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true, icon: FaHome },
  { to: '/blog/', label: 'Blog', icon: FaNewspaper },
  { to: '/about', label: 'About', icon: FaInfoCircle },
  { to: '/contact', label: 'Contact', icon: FaEnvelope },
  { to: '/disclaimer', label: 'Disclaimer', icon: FaExclamationTriangle },
];

export default function Header() {
  const { data: site } = useGetSiteContentQuery();

  return (
    <div className={styles.headerWrap}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand} aria-label="Go to home page">
          <img src="/images/logo.jpeg" alt="" className={styles.logo} width="40" height="40" />
          <span className={styles.siteTitle}>{site?.siteName ?? 'All New Apps'}</span>
        </Link>
      </header>

      <nav id="primary-nav" className={styles.nav}>
        <ul className={styles.navMenu}>
          {NAV_LINKS.map(({ to, label, end, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon className={styles.navIcon} />
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
                <FaTelegramPlane className={styles.navIcon} />
                TG Join
              </a>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}

