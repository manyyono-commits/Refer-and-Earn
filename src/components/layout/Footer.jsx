import { Link } from 'react-router-dom';
import { FaTelegramPlane } from 'react-icons/fa';
import { useGetSiteContentQuery } from '../../services/api';
import styles from './Footer.module.css';

export default function Footer() {
  const { data: site } = useGetSiteContentQuery();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        {site?.telegramUrl && (
          <a
            href={site.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.telegram}
            aria-label="Join our Telegram group"
          >
            <FaTelegramPlane />
          </a>
        )}
        <hr className={styles.rule} />
        <nav className={styles.links} aria-label="Footer">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/disclaimer">Disclaimer</Link>
        </nav>
        <p className={styles.copy}>
          © {year} {site?.siteName ?? 'All New Apps'}. For users aged 18+ only.
        </p>
      </div>
    </footer>
  );
}
