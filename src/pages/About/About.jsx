import { FaBolt, FaGamepad, FaShieldAlt, FaStar, FaSyncAlt, FaUsers } from 'react-icons/fa';
import Seo from '../../components/common/Seo';
import Loader from '../../components/common/Loader';
import { useGetSiteContentQuery } from '../../services/api';
import styles from '../staticPages.module.css';

// Icon names used in site content -> icon components.
const ICONS = { bolt: FaBolt, shield: FaShieldAlt, sync: FaSyncAlt, users: FaUsers, star: FaStar, gamepad: FaGamepad };

export default function About() {
  const { data: site, isLoading } = useGetSiteContentQuery();
  if (isLoading) return <Loader />;

  const page = site?.pages?.about;
  if (!page) return null;

  return (
    <>
      <Seo title={page.title} />
      <div className={`container ${styles.page}`}>
        <h2 className={styles.pageTitle}>{page.title}</h2>

        <div className={`${styles.card} ${styles.fadeIn}`}>
          {page.intro?.map((p) => (
            <p key={p}>{p}</p>
          ))}

          {page.highlight && (
            <div className={styles.highlightBox}>
              <h3>{page.highlight.title}</h3>
              <p>{page.highlight.text}</p>
            </div>
          )}

          {page.features?.length > 0 && (
            <div className={styles.featuresGrid}>
              {page.features.map(({ icon, title, text }) => {
                const Icon = ICONS[icon] ?? FaStar;
                return (
                  <div key={title} className={styles.featureItem}>
                    <Icon className={styles.featureIcon} aria-hidden="true" />
                    <h4>{title}</h4>
                    <p>{text}</p>
                  </div>
                );
              })}
            </div>
          )}

          {page.outro?.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </>
  );
}
