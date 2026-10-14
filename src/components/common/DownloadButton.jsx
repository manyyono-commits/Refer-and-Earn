import { Link } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import styles from './DownloadButton.module.css';

const isExternal = (url) => /^https?:\/\//i.test(url);

/** Routes internally to the app page, or opens an external download URL in a new tab. */
export default function DownloadButton({ to, label = 'Download', ariaLabel, size = 'md', onMouseEnter }) {
  const className = `${styles.btn} ${styles[size]}`;
  const content = (
    <>
      <FaDownload aria-hidden="true" /> {label}
    </>
  );

  if (isExternal(to)) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={className}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={to} className={className} aria-label={ariaLabel} onMouseEnter={onMouseEnter}>
      {content}
    </Link>
  );
}
