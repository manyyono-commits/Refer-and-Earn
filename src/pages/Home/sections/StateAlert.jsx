import AlertBox from '../../../components/common/AlertBox';
import styles from '../Home.module.css';

export default function StateAlert({ content }) {
  return (
    <AlertBox variant="danger" title={content.title}>
      <p>{content.text}</p>
      <div className={styles.states}>
        {content.states.map((state) => (
          <span key={state} className={styles.stateBadge}>
            {state}
          </span>
        ))}
      </div>
    </AlertBox>
  );
}
