import { FaTelegramPlane, FaUsers } from 'react-icons/fa';
import Section from '../../../components/common/Section';
import styles from '../Home.module.css';

export default function Community({ content, telegramUrl }) {
  return (
    <Section title={content.title} icon={FaUsers}>
      <p>{content.text}</p>
      {telegramUrl && (
        <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className={styles.telegramBtn}>
          <FaTelegramPlane aria-hidden="true" /> Join on Telegram
        </a>
      )}
    </Section>
  );
}
