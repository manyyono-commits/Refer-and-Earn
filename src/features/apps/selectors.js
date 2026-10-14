import { createSelector } from '@reduxjs/toolkit';
import { api } from '../../services/api';

const selectAppsResult = api.endpoints.getApps.select();

export const selectAllApps = createSelector(selectAppsResult, (result) => result.data ?? []);

export const selectAppsByCategory = createSelector(
  [selectAllApps, (_state, category) => category],
  (apps, category) => apps.filter((app) => app.category === category),
);

export const selectFeaturedApps = createSelector(selectAllApps, (apps) =>
  apps.filter((app) => app.featured),
);

export const selectRelatedApps = createSelector(
  [selectAllApps, (_state, slug) => slug],
  (apps, slug) => apps.filter((app) => app.slug !== slug),
);
