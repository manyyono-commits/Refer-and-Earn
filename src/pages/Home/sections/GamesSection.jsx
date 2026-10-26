import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaDownload, FaGamepad, FaStar } from 'react-icons/fa';
import Tabs from '../../../components/common/Tabs';
import AppCard from '../../../components/common/AppCard';
import ErrorState from '../../../components/common/ErrorState';
import { CardSkeleton } from '../../../components/common/Loader';
import { useGetAppsQuery } from '../../../services/api';
import { selectAppsByCategory } from '../../../features/apps/selectors';
import { selectActiveTab, setActiveTab } from '../../../features/ui/uiSlice';
import { TABS } from '../../../utils/constants';
import styles from '../Home.module.css';

const TAB_ITEMS = [
  { id: TABS.NEW, label: 'New Games', icon: FaStar },
  { id: TABS.OTHER, label: 'Other Games', icon: FaGamepad },
];

export default function GamesSection({ title }) {
  const dispatch = useDispatch();
  const activeTab = useSelector(selectActiveTab);
  const { isLoading, isError, refetch } = useGetAppsQuery();
  const apps = useSelector((state) => selectAppsByCategory(state, activeTab));

  const handleTabChange = useCallback((id) => dispatch(setActiveTab(id)), [dispatch]);

  return (
    <section id="games">
      <h2 className={styles.gamesTitle}>
        <FaDownload aria-hidden="true" />{' '}
        {title || 'Download NEW YONO Games'}
      </h2>

      <Tabs tabs={TAB_ITEMS} activeId={activeTab} onChange={handleTabChange} idPrefix="games" />

      <div
        className={styles.gamesList}
        role="tabpanel"
        id={`games-panel-${activeTab}`}
        aria-labelledby={`games-${activeTab}`}
      >
        {isLoading && <CardSkeleton />}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading &&
          !isError &&
          apps.map((app, i) => <AppCard key={app.id} app={app} index={i + 1} />)}
      </div>

      {!isLoading && !isError && (
        <p className={styles.count}>
          Showing {apps.length} {activeTab === TABS.NEW ? 'new' : 'other'} apps
        </p>
      )}
    </section>
  );
}
