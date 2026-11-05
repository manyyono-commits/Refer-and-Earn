import { Link } from 'react-router-dom';
import Markdown from '../../components/article/Markdown';
import FaqItem from '../../components/article/FaqItem';
import { formatDate } from './formatDate';
import styles from '../../components/article/Article.module.css';

/** Renders a post body. Shared by the public page and the admin live preview. */
export default function PostView({ post }) {
  const updated =
    post.updatedAt && post.publishedAt && new Date(post.updatedAt) - new Date(post.publishedAt) > 86_400_000;

  return (
    <article className={`container ${styles.page}`}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/blog/">Blog</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{post.title}</span>
      </nav>

      <div className={styles.card}>
        <header>
          <h1 className={styles.title}>{post.title || 'Untitled post'}</h1>
          <div className={styles.meta}>
            {post.author && <span>By {post.author}</span>}
            {post.publishedAt && (
              <span>
                Published <time dateTime={new Date(post.publishedAt).toISOString()}>{formatDate(post.publishedAt)}</time>
              </span>
            )}
            {updated && (
              <span>
                Updated <time dateTime={new Date(post.updatedAt).toISOString()}>{formatDate(post.updatedAt)}</time>
              </span>
            )}
            {post.category && <span>{post.category}</span>}
          </div>
          {post.coverImage && (
            <img
              className={styles.cover}
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              width="1200"
              height="630"
              fetchpriority="high"
            />
          )}
        </header>

        <Markdown source={post.content} />

        {post.tags?.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map((t) => (
              <span key={t} className={styles.tag}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {post.faqs?.length > 0 && (
        <section className={styles.card}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {post.faqs.map((f, i) => (
              <FaqItem key={i} index={i + 1} q={f.q} a={f.a} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
