import { FaMobileAlt, FaCheckCircle } from 'react-icons/fa';
import Section from '../../../components/common/Section';
import styles from '../Home.module.css';

const ITEMS = [
  'Supported Android or other operating system versions',
  'Minimum storage and device requirements',
  'Application version and release date',
  'Supported languages and regions',
  'Account and privacy requirements',
  'Known technical issues and troubleshooting steps',
];

export default function AppFeatures() {
  return (
    <Section title="App Features and Device Compatibility" icon={FaMobileAlt}>
      <p>
        App features and technical requirements vary by application and version. Users should check
        the available documentation before installing software.
      </p>
      <h3 className={styles.subTitle}>Important information to verify includes:</h3>
      <ul className={styles.bullets}>
        {ITEMS.map((item) => (
          <li key={item}>
            <FaCheckCircle aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 12 }}>
        Only publish specific technical requirements when they can be confirmed from reliable
        sources.
      </p>
    </Section>
  );
}
