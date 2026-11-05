import { Link } from 'react-router-dom';
import PageSeo from '../../components/common/PageSeo';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { useGetPostsQuery } from '../../services/api';
import { blogIndexSeo } from '../../../shared/seo/pages';
import { formatDate } from './formatDate';
import styles from '../../components/article/Article.module.css';

export default function BlogList() {
  const { data: posts = [], isLoading, isError, refetch } = useGetPostsQuery();

  return (
    <>
      <PageSeo seo={blogIndexSeo} />
      <div className={`container ${styles.page}`}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Blog</span>
        </nav>

        <header className={styles.card}>
          <h1 className={styles.title}>Yono Games Blog</h1>
          <p>Guides, app information, Android installation help and safety tips from Many Yono Games.</p>
        </header>

        <section className={styles.card} aria-label="Blog posts">
          {isLoading && <Loader />}
          {isError && <ErrorState onRetry={refetch} />}
          {!isLoading && !isError && posts.length === 0 && <p>No posts yet. Check back soon.</p>}
          {posts.length > 0 && (
            <div className={styles.postGrid}>
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}/`} className={styles.postCard}>
                  <img
                    src={post.coverImage || '/images/logo.jpeg'}
                    alt={post.coverImageAlt || ''}
                    loading="lazy"
                    decoding="async"
                    width="1200"
                    height="630"
                  />
                  <div className={styles.postCardBody}>
                    <h2>{post.title}</h2>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    <time className={styles.postCardDate} dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt)}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
