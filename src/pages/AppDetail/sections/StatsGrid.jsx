import styles from '../AppDetail.module.css';

export default function StatsGrid({ app }) {
  const stats = [
    { label: 'Rating', value: app.rating.toFixed(1) },
    { label: 'Downloads', value: app.downloads },
    { label: 'Size', value: app.size },
    { label: 'Version', value: app.version },
  ];

  return (
    <div className={styles.statsGrid}>
      {stats.map(({ label, value }) => (
        <div key={label} className={styles.statCard}>
          <div className={styles.statValue}>{value}</div>
          <div className={styles.statLabel}>{label}</div>
        </div>
      ))}
    </div>
  );
}
