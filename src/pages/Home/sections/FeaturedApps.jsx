import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaFire } from 'react-icons/fa';
import Section from '../../../components/common/Section';
import { selectAllApps, selectFeaturedApps } from '../../../features/apps/selectors';
import styles from '../Home.module.css';

export default function FeaturedApps({ content }) {
  const featured = useSelector(selectFeaturedApps);
  const allApps = useSelector(selectAllApps);

  return (
    <Section title="Featured Apps" icon={FaFire}>
      <span className={styles.score}>{content.score}</span>
      <p>{content.intro}</p>

      <div className={styles.featuredList}>
        {featured.map((app) => (
          <div key={app.id} className={styles.featuredItem}>
            <h3>
              <Link to={`/${app.slug}`}>{app.name}</Link>
            </h3>
            <p>{app.description}</p>
          </div>
        ))}
        <div className={styles.featuredItem}>
          <h3>
            <a href="#games">{content.collectionTitle}</a>
          </h3>
          <p>{content.collectionText}</p>
        </div>
      </div>

      {allApps.length > 0 && (
        <>
          <h3 className={styles.subTitle}>Featured Apps Include</h3>
          <p>
            {allApps.slice(0, 12).map((app, i) => (
              <span key={app.id}>
                <Link to={`/${app.slug}`} style={{ color: 'var(--brand-indigo)' }}>
                  {app.name}
                </Link>
                {i < 11 ? ', ' : ''}
              </span>
            ))}{' '}
            and many more.
          </p>
        </>
      )}
    </Section>
  );
}
