import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import AppIcon from './AppIcon';
import { formatCurrency } from '../../utils/formatCurrency';
import styles from './AppGridCard.module.css';

/** Grid-style card used in the "More apps" section of detail pages. */
function AppGridCard({ app }) {
  return (
    <article className={styles.card}>
      <AppIcon src={app.icon} name={app.name} badge={app.badge} color={app.color} size={64} />
      <div className={styles.content}>
        <h4 className={styles.title}>{app.name}</h4>
        <div className={styles.rating}>
          <FaStar aria-hidden="true" /> {app.rating.toFixed(1)}
        </div>
        <div className={styles.bonus}>Bonus {formatCurrency(app.bonus)}</div>
        <div className={styles.withdraw}>Min. Withdraw {formatCurrency(app.minWithdraw)}</div>
      </div>
      <Link to={`/${app.slug}`} className={styles.button} aria-label={`View ${app.name}`}>
        Get App
      </Link>
    </article>
  );
}

export default memo(AppGridCard);
