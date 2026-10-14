import { createSlice } from '@reduxjs/toolkit';
import { TABS, TAB_STORAGE_KEY } from '../../utils/constants';
import { readStorage } from '../../utils/storage';

const storedTab = readStorage(window.sessionStorage, TAB_STORAGE_KEY);

const initialState = {
  activeTab: Object.values(TABS).includes(storedTab) ? storedTab : TABS.NEW,
  mobileMenuOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu(state) {
      state.mobileMenuOpen = false;
    },
  },
});

export const { setActiveTab, toggleMobileMenu, closeMobileMenu } = uiSlice.actions;

export const selectActiveTab = (state) => state.ui.activeTab;
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;

export default uiSlice.reducer;
