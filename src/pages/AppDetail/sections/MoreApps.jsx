import { useSelector } from 'react-redux';
import { FaThLarge } from 'react-icons/fa';
import Section from '../../../components/common/Section';
import AppGridCard from '../../../components/common/AppGridCard';
import { selectRelatedApps } from '../../../features/apps/selectors';
import styles from '../AppDetail.module.css';

export default function MoreApps({ currentSlug }) {
  const apps = useSelector((state) => selectRelatedApps(state, currentSlug));

  if (!apps.length) return null;

  return (
    <Section title="More Apps You May Like" icon={FaThLarge}>
      <div className={styles.moreGrid}>
        {apps.map((app) => (
          <AppGridCard key={app.id} app={app} />
        ))}
      </div>
    </Section>
  );
}
