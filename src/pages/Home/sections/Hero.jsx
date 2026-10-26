/* eslint-disable no-unused-vars */
import styles from '../Home.module.css';

export default function Hero({ title, text }) {
  return (
    <section className={styles.hero}>
      <h1 className={styles.mainTitle}>
        {title || 'Yono Games: App Information, Features and User Guide'}
      </h1>
      <div className={styles.heroText}>
        <p>
          Welcome to ManyYonoGames.com, an information website for users researching gaming apps,
          app features, compatibility and installation requirements.
        </p>
        <p>
          Before installing any gaming application, it is important to understand who publishes it,
          which devices it supports, what permissions it requests and how it handles personal
          information. App names alone do not establish authenticity, and different applications may
          use similar names.
        </p>
        <p>
          Our aim is to help users find clear, accurate information about gaming apps and understand
          the checks they should complete before installing software on their devices.
        </p>
      </div>
    </section>
  );
}
