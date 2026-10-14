import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CACHE_PREFIX } from '../utils/constants';
import { readStorage, writeStorage } from '../utils/storage';

const isServerOrNetworkError = (error) =>
  error?.status === 'FETCH_ERROR' || (typeof error?.status === 'number' && error.status >= 500);

/**
 * Wraps fetchBaseQuery with a persistent localStorage cache validated by ETag.
 * - Every GET sends `If-None-Match` with the stored ETag. If nothing changed the
 *   server answers 304 (no body) and the stored copy is used.
 * - Changed data (e.g. a listing added in the admin panel) arrives as a normal 200.
 * - If the network or server fails, the last stored copy is served as a fallback.
 * Only GET requests are cached.
 */
export const createCachedBaseQuery = ({ baseUrl, prepareHeaders }) => {
  const rawBaseQuery = fetchBaseQuery({ baseUrl, prepareHeaders });

  return async (args, api, extraOptions) => {
    const request = typeof args === 'string' ? { url: args } : args;
    const method = (request.method || 'GET').toUpperCase();

    if (method !== 'GET') return rawBaseQuery(args, api, extraOptions);

    const key = `${CACHE_PREFIX}${baseUrl}/${request.url}`;
    const cached = readStorage(window.localStorage, key);

    const result = await rawBaseQuery(
      {
        ...request,
        cache: 'no-store',
        headers: cached?.etag ? { ...request.headers, 'If-None-Match': cached.etag } : request.headers,
        validateStatus: (response) => response.ok || response.status === 304,
      },
      api,
      extraOptions,
    );

    if (result.meta?.response?.status === 304 && cached) {
      return { data: cached.data, meta: result.meta };
    }

    if (!result.error) {
      writeStorage(window.localStorage, key, {
        data: result.data,
        etag: result.meta?.response?.headers.get('ETag'),
        timestamp: Date.now(),
      });
      return result;
    }

    if (cached && isServerOrNetworkError(result.error)) return { data: cached.data };
    return result;
  };
};
