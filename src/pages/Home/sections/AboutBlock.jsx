import { FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import Section from '../../../components/common/Section';
import styles from '../Home.module.css';

const BulletList = ({ items }) => (
  <ul className={styles.bullets}>
    {items.map((item) => (
      <li key={item}>
        <FaCheckCircle aria-hidden="true" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export default function AboutBlock({ content }) {
  return (
    <Section title={content.title} icon={FaInfoCircle}>
      <p>{content.intro}</p>
      <h3 className={styles.subTitle}>{content.whyTitle}</h3>
      <BulletList items={content.why} />
      <h3 className={styles.subTitle}>{content.genresTitle}</h3>
      <BulletList items={content.genres} />
    </Section>
  );
}
