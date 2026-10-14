import { FaRedo } from 'react-icons/fa';
import styles from './ErrorState.module.css';

export default function ErrorState({ message = 'Something went wrong while loading data.', onRetry }) {
  return (
    <div className={styles.wrap} role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          <FaRedo aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  );
}
