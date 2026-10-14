import styles from './Loader.module.css';

export default function Loader({ label = 'Loading' }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

/** Placeholder rows shown while the app list loads. */
export function CardSkeleton({ count = 6 }) {
  return (
    <div className={styles.skeletonList} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.skeleton}>
          <div className={styles.skIcon} />
          <div className={styles.skLines}>
            <div className={styles.skLine} />
            <div className={`${styles.skLine} ${styles.short}`} />
          </div>
          <div className={styles.skButton} />
        </div>
      ))}
    </div>
  );
}
