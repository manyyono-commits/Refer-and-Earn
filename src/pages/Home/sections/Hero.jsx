import styles from '../Home.module.css';

export default function Hero({ title, text }) {
  return (
    <section className={styles.hero}>
      <h1 className={styles.mainTitle}>{title}</h1>
      <p className={styles.heroText}>{text}</p>
    </section>
  );
}
