import styles from '../Home.module.css';

export default function PromoBanner({ text }) {
  return <div className={styles.promo}>{text}</div>;
}
