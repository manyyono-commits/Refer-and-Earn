import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import styles from './Article.module.css';

/** Collapsible FAQ row. The answer stays in the DOM (hidden) so crawlers can read it. */
export default function FaqItem({ index, q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.faqItem} ${open ? styles.faqOpen : ''}`}>
      <h3 className={styles.faqHeading}>
        <button type="button" className={styles.faqQuestion} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <span>
            {index}. {q}
          </span>
          <FaChevronDown className={styles.faqChevron} aria-hidden="true" />
        </button>
      </h3>
      <p className={styles.faqAnswer} hidden={!open}>
        {a}
      </p>
    </div>
  );
}
