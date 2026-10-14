import { FaGift, FaStar, FaWallet } from 'react-icons/fa';
import AppIcon from '../../../components/common/AppIcon';
import DownloadButton from '../../../components/common/DownloadButton';
import { formatCurrency } from '../../../utils/formatCurrency';
import styles from '../AppDetail.module.css';

export default function DetailHero({ app }) {
  return (
    <section className={styles.hero}>
      <AppIcon src={app.icon} name={app.name} badge={app.badge} color={app.color} size={110} />
      <div className={styles.heroInfo}>
        <h1 className={styles.appName}>{app.name}</h1>
        <div className={styles.meta}>
          <span className={`${styles.chip} ${styles.chipBonus}`}>
            <FaGift aria-hidden="true" /> Sign Up Bonus {formatCurrency(app.bonus)}
          </span>
          <span className={styles.chip}>
            <FaWallet aria-hidden="true" /> Min. Withdraw {formatCurrency(app.minWithdraw)}
          </span>
          <span className={`${styles.chip} ${styles.chipRating}`}>
            <FaStar aria-hidden="true" /> {app.rating.toFixed(1)}
          </span>
        </div>
        <p className={styles.description}>{app.description}</p>
        <DownloadButton
          to={app.downloadUrl}
          size="lg"
          label={`Download ${app.name}`}
          ariaLabel={`Download ${app.name} app`}
        />
      </div>
    </section>
  );
}
