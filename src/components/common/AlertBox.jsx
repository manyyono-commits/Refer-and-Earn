import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import styles from './AlertBox.module.css';

const ICONS = { danger: FaExclamationTriangle, warning: FaExclamationTriangle, info: FaInfoCircle };

export default function AlertBox({ variant = 'info', title, children }) {
  const Icon = ICONS[variant];
  return (
    <div className={`${styles.alert} ${styles[variant]}`} role={variant === 'danger' ? 'alert' : 'note'}>
      {title && (
        <h3 className={styles.title}>
          <Icon aria-hidden="true" /> {title}
        </h3>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
