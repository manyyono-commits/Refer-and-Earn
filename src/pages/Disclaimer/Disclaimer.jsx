import Seo from '../../components/common/Seo';
import Loader from '../../components/common/Loader';
import { useGetSiteContentQuery } from '../../services/api';
import styles from '../staticPages.module.css';

export default function Disclaimer() {
  const { data: site, isLoading } = useGetSiteContentQuery();
  if (isLoading) return <Loader />;

  const page = site?.pages?.disclaimer;
  if (!page) return null;

  return (
    <>
      <Seo title={page.title} />
      <div className={`container ${styles.page}`}>
        <h2 className={styles.pageTitle}>{page.title}</h2>

        <div className={`${styles.card} ${styles.fadeIn}`}>
          {page.welcome && (
            <div className={styles.welcomeSection}>
              <h3 className={styles.welcomeTitle}>{page.welcome.title}</h3>
              <p className={styles.sectionText}>{page.welcome.text}</p>
            </div>
          )}

          {page.sections?.map((section) => (
            <div key={section.title} className={styles.disclaimerSection}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
              {section.text && <p className={styles.sectionText}>{section.text}</p>}
              {section.subsections?.map((sub) => (
                <div key={sub.title} className={styles.subsection}>
                  <h4 className={styles.subsectionTitle}>{sub.title}</h4>
                  <p className={styles.subsectionContent}>{sub.text}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
