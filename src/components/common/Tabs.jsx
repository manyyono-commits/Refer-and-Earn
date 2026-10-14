import styles from './Tabs.module.css';

/** Accessible tab list. `tabs` = [{ id, label, icon }] */
export default function Tabs({ tabs, activeId, onChange, idPrefix = 'tab' }) {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = id === activeId;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            id={`${idPrefix}-${id}`}
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${id}`}
            className={`${styles.tab} ${active ? styles.active : ''}`}
            onClick={() => onChange(id)}
          >
            {Icon && <Icon aria-hidden="true" />} {label}
          </button>
        );
      })}
    </div>
  );
}
