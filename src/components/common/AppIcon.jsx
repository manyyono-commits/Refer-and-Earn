import { memo, useState } from 'react';
import styles from './AppIcon.module.css';

/** App icon with a coloured text badge fallback when the image fails to load. */
function AppIcon({ src, name, badge, color = 'var(--brand-indigo)', size = 56 }) {
  const [failed, setFailed] = useState(!src);
  const dimension = { width: size, height: size };

  if (failed) {
    return (
      <div className={styles.fallback} style={{ ...dimension, background: color }} aria-hidden="true">
        {badge || name?.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} app icon`}
      loading="lazy"
      decoding="async"
      className={styles.icon}
      style={dimension}
      onError={() => setFailed(true)}
    />
  );
}

export default memo(AppIcon);
