import { createSlice } from '@reduxjs/toolkit';
import { ADMIN_TOKEN_KEY } from '../../utils/constants';
import { readStorage } from '../../utils/storage';

/** True when the JWT is malformed or past its `exp` claim. Signature is checked by the server. */
export const isTokenExpired = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload));
    return !exp || exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const storedToken = readStorage(window.localStorage, ADMIN_TOKEN_KEY);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    token: storedToken && !isTokenExpired(storedToken) ? storedToken : null,
  },
  reducers: {
    loginSucceeded(state, action) {
      state.token = action.payload;
    },
    logout(state) {
      state.token = null;
    },
  },
});

export const { loginSucceeded, logout } = adminSlice.actions;

export const selectAdminToken = (state) => state.admin.token;
export const selectIsAdmin = (state) => Boolean(state.admin.token) && !isTokenExpired(state.admin.token);

export default adminSlice.reducer;
