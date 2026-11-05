import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEdit, FaExternalLinkAlt, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import Loader from '../../../components/common/Loader';
import ErrorState from '../../../components/common/ErrorState';
import { getErrorMessage, useDeletePostMutation, useGetAdminPostsQuery } from '../../../services/adminApi';
import { formatDate } from '../../Blog/formatDate';
import styles from '../Admin.module.css';

const isScheduled = (p) => p.status === 'published' && p.publishedAt && new Date(p.publishedAt) > new Date();

export default function AdminPosts() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: posts = [], isLoading, isError, refetch } = useGetAdminPostsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [deletePost] = useDeletePostMutation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [message, setMessage] = useState(location.state?.flash ?? null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (location.state?.flash) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  const stats = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((p) => p.status === 'published' && !isScheduled(p)).length,
      scheduled: posts.filter(isScheduled).length,
      drafts: posts.filter((p) => p.status === 'draft').length,
    }),
    [posts],
  );

  const q = search.trim().toLowerCase();
  const visible = posts.filter(
    (p) =>
      (status === 'all' || p.status === status) &&
      (!q || p.title.toLowerCase().includes(q) || p.slug.includes(q)),
  );

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setBusyId(post.id);
    try {
      await deletePost(post.id).unwrap();
      setMessage({ type: 'success', text: `"${post.title}" was deleted.` });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1>Blog Posts</h1>
          <p className={styles.muted}>Write, edit and publish blog posts with full SEO settings.</p>
        </div>
        <Link to="/admin/posts/new" className={styles.primaryBtn}>
          <FaPlus aria-hidden="true" /> New Post
        </Link>
      </div>

      <div className={styles.statsRow}>
        {[
          ['Total posts', stats.total],
          ['Published', stats.published],
          ['Scheduled', stats.scheduled],
          ['Drafts', stats.drafts],
        ].map(([label, value]) => (
          <div key={label} className={styles.statTile}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {message && (
        <div
          className={message.type === 'error' ? styles.errorBanner : styles.successBanner}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          {message.text}
          <button type="button" className={styles.dismiss} onClick={() => setMessage(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <FaSearch aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by title or slug"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search posts"
          />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div className={styles.empty}>
          {posts.length === 0 ? 'No posts yet. Write your first one.' : 'No posts match your search.'}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Post</th>
                <th>Status</th>
                <th>Published</th>
                <th>Updated</th>
                <th className={styles.actionsCol}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((post) => {
                const scheduled = isScheduled(post);
                const live = post.status === 'published' && !scheduled;
                return (
                  <tr key={post.id} className={busyId === post.id ? styles.rowBusy : undefined}>
                    <td data-label="Post">
                      <div className={styles.appName}>{post.title}</div>
                      <div className={styles.slug}>/blog/{post.slug}/</div>
                    </td>
                    <td data-label="Status">
                      <span className={live ? styles.tagNew : styles.tagOther}>
                        {scheduled ? 'Scheduled' : live ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td data-label="Published">{formatDate(post.publishedAt) || '—'}</td>
                    <td data-label="Updated">{formatDate(post.updatedAt)}</td>
                    <td data-label="Actions">
                      <div className={styles.actions}>
                        {live && (
                          <a
                            href={`/blog/${post.slug}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.iconBtn}
                            aria-label={`View ${post.title} on site`}
                          >
                            <FaExternalLinkAlt />
                          </a>
                        )}
                        <Link to={`/admin/posts/${post.id}/edit`} className={styles.iconBtn} aria-label={`Edit ${post.title}`}>
                          <FaEdit />
                        </Link>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.danger}`}
                          onClick={() => handleDelete(post)}
                          disabled={busyId === post.id}
                          aria-label={`Delete ${post.title}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
