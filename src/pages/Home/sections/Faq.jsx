import { useState } from 'react';
import { FaQuestionCircle, FaChevronDown } from 'react-icons/fa';
import Section from '../../../components/common/Section';
import styles from '../Home.module.css';

const FAQS = [
  {
    q: 'What is Yono Games?',
    a: 'Yono Games is a search term associated with gaming applications. The exact application, publisher and features should be verified before making claims about a particular product.',
  },
  {
    q: 'What is Yono777?',
    a: 'Yono777 is a name used in gaming-related searches. Users should confirm the identity of the specific application, its publisher and its official documentation before installing it.',
  },
  {
    q: 'What is Yonorummy?',
    a: 'Yonorummy is a gaming-related search term. The specific product and its features should be established using reliable publisher information rather than assumptions based on the name.',
  },
  {
    q: 'What is Jaiho777?',
    a: 'Jaiho777 is a name used in gaming-related searches. Its identity, availability and features should be confirmed through reliable sources before presenting details as fact.',
  },
  {
    q: 'How can I check whether a gaming app is genuine?',
    a: 'Check the publisher, official distribution source, package information, permissions and privacy policy. If these details cannot be verified, avoid installing the application.',
  },
  {
    q: 'Is an APK file safe to install?',
    a: 'Not necessarily. APK files from unverified sources can contain malicious software or request excessive permissions. Check the source and file carefully before installation.',
  },
  {
    q: 'How do I check whether an app supports my device?',
    a: 'Consult the publisher\u2019s verified system requirements and compare them with your device\u2019s operating system version and available storage.',
  },
  {
    q: 'Does ManyYonoGames.com publish official applications?',
    a: 'The website should clearly state its actual relationship with each application. Do not claim to be an official publisher or distributor unless that relationship can be verified.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${styles.faqItem} ${open ? styles.faqOpen : ''}`}>
      <button
        className={styles.faqQuestion}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <FaChevronDown className={styles.faqChevron} aria-hidden="true" />
      </button>
      {open && <p className={styles.faqAnswer}>{a}</p>}
    </div>
  );
}

export default function Faq() {
  return (
    <Section title="Frequently Asked Questions About Yono Games" icon={FaQuestionCircle}>
      <div className={styles.faqList}>
        {FAQS.map(({ q, a }) => (
          <FaqItem key={q} q={q} a={a} />
        ))}
      </div>
    </Section>
  );
}
