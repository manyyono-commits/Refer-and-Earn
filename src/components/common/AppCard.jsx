import { memo } from 'react';
import { FaGift, FaWallet } from 'react-icons/fa';
import AppIcon from './AppIcon';
import DownloadButton from './DownloadButton';
import { usePrefetch } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import styles from './AppCard.module.css';

/** List-style card used on the home page. */
function AppCard({ app, index }) {
  const prefetchSite = usePrefetch('getSiteContent');

  return (
    <article className={styles.card}>
      {index != null && <div className={styles.number}>{index}</div>}
      <AppIcon src={app.icon} name={app.name} badge={app.badge} color={app.color} />
      <div className={styles.info}>
        <h3 className={styles.name}>{app.name}</h3>
        <div className={styles.details}>
          <span className={styles.bonus}>
            <FaGift aria-hidden="true" /> Sign Up Bonus {formatCurrency(app.bonus)}
          </span>
          <span className={styles.withdraw}>
            <FaWallet aria-hidden="true" /> Min. Withdraw {formatCurrency(app.minWithdraw)}
          </span>
        </div>
      </div>
      <DownloadButton
        to={`/${app.slug}`}
        ariaLabel={`Download ${app.name} app`}
        onMouseEnter={() => prefetchSite()}
      />
    </article>
  );
}

export default memo(AppCard);
