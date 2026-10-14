import { FaCommentDots, FaStar } from 'react-icons/fa';
import Section from '../../../components/common/Section';
import styles from '../AppDetail.module.css';

const Stars = ({ rating }) => (
  <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} className={i < rating ? undefined : styles.starEmpty} aria-hidden="true" />
    ))}
  </span>
);

export default function Reviews({ reviews }) {
  return (
    <Section title="User Reviews" icon={FaCommentDots}>
      <div className={styles.reviewGrid}>
        {reviews.map((review) => (
          <div key={review.name} className={styles.reviewCard}>
            <div className={styles.reviewHead}>
              <span className={styles.reviewName}>{review.name}</span>
              <Stars rating={review.rating} />
            </div>
            <p>{review.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
