import { FaShieldAlt } from 'react-icons/fa';
import Section from '../../../components/common/Section';
import styles from '../Home.module.css';

const STEPS = [
  'Verify the publisher and distribution source.',
  'Check the file\u2019s authenticity and package information.',
  'Review requested permissions.',
  'Use reputable security tools to scan unfamiliar files.',
  'Avoid files that request unnecessary access or make misleading claims.',
];

export default function ApkSafety() {
  return (
    <Section title="Understanding APK Files and Installation Safety" icon={FaShieldAlt}>
      <p>
        An APK is an Android application package used to distribute and install Android
        applications.
      </p>
      <p>
        Installing an APK from an unfamiliar website can expose a device to security risks,
        including malicious software, excessive permissions and unwanted data collection.
      </p>
      <h3 className={styles.subTitle}>Before opening an APK file:</h3>
      <ol className={styles.numberedList}>
        {STEPS.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <p style={{ marginTop: 12 }}>
        No individual security check can guarantee that a file is safe. Where an application cannot
        be verified, do not install it.
      </p>
    </Section>
  );
}
