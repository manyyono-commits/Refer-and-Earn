import { createApi } from '@reduxjs/toolkit/query/react';
import { createCachedBaseQuery } from './cachedBaseQuery';
import { API_BASE_URL, MEMORY_CACHE_SECONDS } from '../utils/constants';
import { logout, selectAdminToken } from '../features/admin/adminSlice';

const cachedBaseQuery = createCachedBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = selectAdminToken(getState());
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// Logs the admin out when the server rejects their token.
const baseQuery = async (args, api, extraOptions) => {
  const result = await cachedBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401 && selectAdminToken(api.getState())) {
    api.dispatch(logout());
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  keepUnusedDataFor: MEMORY_CACHE_SECONDS,
  // Revalidation is cheap (304 when unchanged), so pick up new listings when the tab regains focus.
  refetchOnFocus: true,
  tagTypes: ['Apps', 'Site'],
  endpoints: (builder) => ({
    getApps: builder.query({
      query: () => 'apps',
      transformResponse: (response) => response.apps ?? [],
      providesTags: ['Apps'],
    }),
    getSiteContent: builder.query({
      query: () => 'site',
      providesTags: ['Site'],
    }),
  }),
});

export const { useGetAppsQuery, useGetSiteContentQuery, usePrefetch } = api;

/**
 * Reads a single app from the cached apps list, so detail pages
 * never need a separate request.
 */
export const useGetAppBySlugQuery = (slug) =>
  useGetAppsQuery(undefined, {
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: data?.find((app) => app.slug === slug),
      allApps: data,
    }),
  });
