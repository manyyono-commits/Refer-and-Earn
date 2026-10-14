import { FaQuestionCircle } from 'react-icons/fa';
import Section from '../../../components/common/Section';
import styles from '../AppDetail.module.css';

export default function Faq({ items }) {
  return (
    <Section title="Frequently Asked Questions" icon={FaQuestionCircle}>
      {items.map(({ q, a }) => (
        <details key={q} className={styles.faqItem}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </Section>
  );
}
