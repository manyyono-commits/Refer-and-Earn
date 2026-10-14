import { FaCheckCircle, FaLightbulb } from 'react-icons/fa';
import Section from '../../../components/common/Section';
import styles from '../Home.module.css';

export default function Tips({ content }) {
  return (
    <Section title={content.title} icon={FaLightbulb}>
      <ul className={styles.bullets}>
        {content.items.map((tip) => (
          <li key={tip}>
            <FaCheckCircle aria-hidden="true" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
