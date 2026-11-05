import styles from './Section.module.css';

/** White content card with an optional heading (h2 by default). */
export default function Section({ title, icon: Icon, children, className = '', id, level = 2 }) {
  const Heading = `h${level}`;
  return (
    <section className={`${styles.section} ${className}`} id={id}>
      {title && (
        <Heading className={styles.title}>
          {Icon && <Icon aria-hidden="true" className={styles.icon} />}
          {title}
        </Heading>
      )}
      {children}
    </section>
  );
}
