import Seo from '../../components/common/Seo';
import Loader from '../../components/common/Loader';
import { useGetSiteContentQuery } from '../../services/api';
import styles from '../staticPages.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Email values in the table become mailto links.
const renderValue = (value) => (EMAIL_RE.test(value) ? <a href={`mailto:${value}`}>{value}</a> : value);

export default function Contact() {
  const { data: site, isLoading } = useGetSiteContentQuery();
  if (isLoading) return <Loader />;

  const page = site?.pages?.contact;
  if (!page) return null;

  const { business } = page;

  return (
    <>
      <Seo title={page.title} />
      <div className={`container ${styles.page}`}>
        <h2 className={styles.pageTitle}>{page.title}</h2>

        <div className={`${styles.card} ${styles.fadeIn}`}>
          {page.notice && <div className={styles.supportNotice}>{page.notice}</div>}

          {business && (
            <div>
              <h3 className={styles.businessTitle}>{business.title}</h3>
              <table className={styles.contactTable}>
                <thead>
                  <tr>
                    <th colSpan={business.columns.length}>{business.tableTitle}</th>
                  </tr>
                  <tr>
                    {business.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {business.rows.map(([label, value]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{renderValue(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {page.sections?.map((section) => (
          <div key={section.title} className={`${styles.card} ${styles.fadeIn}`}>
            <h3 className={styles.businessTitle}>{section.title}</h3>
            {section.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
