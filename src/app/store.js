import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '../services/api';
import uiReducer, { setActiveTab } from '../features/ui/uiSlice';
import adminReducer, { loginSucceeded, logout } from '../features/admin/adminSlice';
import { ADMIN_TOKEN_KEY, TAB_STORAGE_KEY } from '../utils/constants';
import { writeStorage } from '../utils/storage';

// Persists the selected tab (per session) and the admin token (until it expires).
const persistMiddleware = () => (next) => (action) => {
  const result = next(action);
  if (setActiveTab.match(action)) {
    writeStorage(window.sessionStorage, TAB_STORAGE_KEY, action.payload);
  } else if (loginSucceeded.match(action)) {
    writeStorage(window.localStorage, ADMIN_TOKEN_KEY, action.payload);
  } else if (logout.match(action)) {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
  return result;
};

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    ui: uiReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware, persistMiddleware),
});

// Enables refetchOnFocus / refetchOnReconnect behaviours.
setupListeners(store.dispatch);
