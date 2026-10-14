import Section from '../../../components/common/Section';
import styles from '../AppDetail.module.css';

/** Reusable titled grid of { title, text } cards — used for steps, trust and security. */
export default function CardGrid({ title, icon, items, numbered = false }) {
  return (
    <Section title={title} icon={icon}>
      <div className={styles.cardGrid}>
        {items.map((item, i) => (
          <div key={item.title} className={styles.infoCard}>
            {numbered && <span className={styles.stepNumber}>{i + 1}</span>}
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
