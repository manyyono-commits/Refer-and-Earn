import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaArrowDown,
  FaArrowUp,
  FaEdit,
  FaExternalLinkAlt,
  FaPlus,
  FaSearch,
  FaStar,
  FaTrash,
} from 'react-icons/fa';
import AppIcon from '../../../components/common/AppIcon';
import Loader from '../../../components/common/Loader';
import ErrorState from '../../../components/common/ErrorState';
import { useGetAppsQuery } from '../../../services/api';
import {
  getErrorMessage,
  useDeleteAppMutation,
  useReorderAppsMutation,
  useUpdateAppMutation,
} from '../../../services/adminApi';
import { formatCurrency } from '../../../utils/formatCurrency';
import styles from '../Admin.module.css';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: apps = [], isLoading, isError, refetch } = useGetAppsQuery();
  const [updateApp] = useUpdateAppMutation();
  const [deleteApp] = useDeleteAppMutation();
  const [reorderApps, { isLoading: reordering }] = useReorderAppsMutation();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [message, setMessage] = useState(location.state?.flash ?? null);
  const [busyId, setBusyId] = useState(null);

  const stats = useMemo(
    () => ({
      total: apps.length,
      new: apps.filter((a) => a.category === 'new').length,
      other: apps.filter((a) => a.category === 'other').length,
      featured: apps.filter((a) => a.featured).length,
    }),
    [apps],
  );

  const query = search.trim().toLowerCase();
  const isFiltered = Boolean(query) || category !== 'all';
  const visibleApps = useMemo(
    () =>
      apps.filter(
        (app) =>
          (category === 'all' || app.category === category) &&
          (!query || app.name.toLowerCase().includes(query) || app.slug.includes(query)),
      ),
    [apps, category, query],
  );

  const showMessage = (type, text) => setMessage({ type, text });

  const run = async (id, action, successText) => {
    setBusyId(id);
    try {
      await action();
      if (successText) showMessage('success', successText);
    } catch (err) {
      showMessage('error', getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const toggleFeatured = (app) =>
    run(app.id, () => updateApp({ id: app.id, featured: !app.featured }).unwrap());

  const handleDelete = (app) => {
    if (!window.confirm(`Delete "${app.name}"? This cannot be undone.`)) return;
    run(app.id, () => deleteApp(app.id).unwrap(), `"${app.name}" was deleted.`);
  };

  const move = (index, direction) => {
    const ids = apps.map((a) => a.id);
    const target = index + direction;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(null, () => reorderApps(ids).unwrap());
  };

  // Clear the one-time flash message from history so it doesn't reappear on refresh.
  useEffect(() => {
    if (location.state?.flash) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1>App Listings</h1>
          <p className={styles.muted}>Add, edit and arrange the apps shown on the website.</p>
        </div>
        <Link to="/admin/apps/new" className={styles.primaryBtn}>
          <FaPlus aria-hidden="true" /> Add App
        </Link>
      </div>

      <div className={styles.statsRow}>
        {[
          ['Total apps', stats.total],
          ['New Games tab', stats.new],
          ['Other Games tab', stats.other],
          ['Featured', stats.featured],
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
            placeholder="Search by name or slug"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search apps"
          />
        </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by tab">
          <option value="all">All tabs</option>
          <option value="new">New Games</option>
          <option value="other">Other Games</option>
        </select>
      </div>
      {isFiltered && (
        <p className={styles.hint}>Clear the search and filter to change the order.</p>
      )}

      {visibleApps.length === 0 ? (
        <div className={styles.empty}>
          {apps.length === 0 ? 'No apps yet. Add your first listing.' : 'No apps match your search.'}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>App</th>
                <th>Tab</th>
                <th>Bonus</th>
                <th>Min. W/D</th>
                <th>Featured</th>
                <th className={styles.actionsCol}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleApps.map((app) => {
                const index = apps.indexOf(app);
                const busy = busyId === app.id;
                return (
                  <tr key={app.id} className={busy ? styles.rowBusy : undefined}>
                    <td data-label="Order">
                      <div className={styles.orderCell}>
                        <span className={styles.position}>{index + 1}</span>
                        {!isFiltered && (
                          <>
                            <button
                              type="button"
                              className={styles.iconBtn}
                              onClick={() => move(index, -1)}
                              disabled={index === 0 || reordering}
                              aria-label={`Move ${app.name} up`}
                            >
                              <FaArrowUp />
                            </button>
                            <button
                              type="button"
                              className={styles.iconBtn}
                              onClick={() => move(index, 1)}
                              disabled={index === apps.length - 1 || reordering}
                              aria-label={`Move ${app.name} down`}
                            >
                              <FaArrowDown />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td data-label="App">
                      <div className={styles.appCell}>
                        <AppIcon src={app.icon} name={app.name} badge={app.badge} color={app.color} size={40} />
                        <div>
                          <div className={styles.appName}>{app.name}</div>
                          <div className={styles.slug}>/{app.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Tab">
                      <span className={app.category === 'new' ? styles.tagNew : styles.tagOther}>
                        {app.category === 'new' ? 'New' : 'Other'}
                      </span>
                    </td>
                    <td data-label="Bonus">{formatCurrency(app.bonus)}</td>
                    <td data-label="Min. W/D">{formatCurrency(app.minWithdraw)}</td>
                    <td data-label="Featured">
                      <button
                        type="button"
                        className={`${styles.starBtn} ${app.featured ? styles.starOn : ''}`}
                        onClick={() => toggleFeatured(app)}
                        disabled={busy}
                        aria-pressed={app.featured}
                        aria-label={app.featured ? `Unfeature ${app.name}` : `Feature ${app.name}`}
                      >
                        <FaStar />
                      </button>
                    </td>
                    <td data-label="Actions">
                      <div className={styles.actions}>
                        <a
                          href={`/${app.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.iconBtn}
                          aria-label={`View ${app.name} on site`}
                        >
                          <FaExternalLinkAlt />
                        </a>
                        <Link
                          to={`/admin/apps/${app.id}/edit`}
                          className={styles.iconBtn}
                          aria-label={`Edit ${app.name}`}
                        >
                          <FaEdit />
                        </Link>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.danger}`}
                          onClick={() => handleDelete(app)}
                          disabled={busy}
                          aria-label={`Delete ${app.name}`}
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
