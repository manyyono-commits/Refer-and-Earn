import styles from './Section.module.css';

/** White content card with an optional heading. */
export default function Section({ title, icon: Icon, children, className = '', id }) {
  return (
    <section className={`${styles.section} ${className}`} id={id}>
      {title && (
        <h2 className={styles.title}>
          {Icon && <Icon aria-hidden="true" className={styles.icon} />}
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
