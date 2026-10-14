import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import Seo from '../../components/common/Seo';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <>
      <Seo title="Page Not Found" />
      <div className={`container ${styles.wrap}`}>
        <h1 className={styles.code}>404</h1>
        <p className={styles.text}>The page or app you are looking for does not exist.</p>
        <Link to="/" className={styles.home}>
          <FaHome aria-hidden="true" /> Back to Home
        </Link>
      </div>
    </>
  );
}
