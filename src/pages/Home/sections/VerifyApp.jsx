import { FaUserShield, FaCheckCircle } from 'react-icons/fa';
import Section from '../../../components/common/Section';
import styles from '../Home.module.css';

const CHECKS = [
  {
    heading: 'Check the publisher',
    text: 'Look for the publisher\u2019s name, official website and verifiable contact information. Do not assume that a website is officially connected to an app simply because it uses the same brand name.',
  },
  {
    heading: 'Check the application source',
    text: 'Prefer a verified official distribution source. Be cautious of websites that provide unexplained files, misleading buttons or links to unrelated applications.',
  },
  {
    heading: 'Review app permissions',
    text: 'Understand why an application requests access to your device\u2019s storage, camera, contacts or other information. Permissions should be relevant to the app\u2019s stated functions.',
  },
  {
    heading: 'Read the privacy policy',
    text: 'Review what information the app collects, how it uses that information and whether it shares data with other parties.',
  },
  {
    heading: 'Check applicable restrictions',
    text: 'Gaming applications may be subject to different legal requirements depending on their features and location. Check the applicable rules before accessing or distributing an application.',
  },
];

export default function VerifyApp() {
  return (
    <Section title="How to Verify a Gaming App Before Installing" icon={FaUserShield}>
      <p>Checking an app&rsquo;s identity and source is an important step before installation.</p>
      <ul className={styles.bullets}>
        {CHECKS.map(({ heading, text }) => (
          <li key={heading}>
            <FaCheckCircle aria-hidden="true" />
            <span>
              <strong>{heading}:</strong> {text}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
