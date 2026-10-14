// Bump CACHE_VERSION whenever the shape of the API data changes to invalidate stored caches.
export const CACHE_VERSION = 'v2';
export const CACHE_PREFIX = `appdir:${CACHE_VERSION}:`;
export const MEMORY_CACHE_SECONDS = 600; // RTK Query in-memory cache lifetime

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const TAB_STORAGE_KEY = 'appdir:activeTab';
export const ADMIN_TOKEN_KEY = 'appdir:adminToken';

export const TABS = {
  NEW: 'new',
  OTHER: 'other',
};
