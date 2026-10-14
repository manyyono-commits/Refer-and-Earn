import { api } from './api';

/**
 * Once the server confirms a change, apply it to the cached app list right away
 * so the admin never sees stale rows while the background refetch runs.
 */
const applyToCachedApps = (recipe) => async (arg, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(api.util.updateQueryData('getApps', undefined, (draft) => recipe(draft, data, arg)));
  } catch {
    /* error is handled by the caller */
  }
};

/** Admin-only endpoints. Every mutation refreshes the public app list. */
export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    adminLogin: builder.mutation({
      query: (password) => ({ url: 'admin/login', method: 'POST', body: { password } }),
    }),
    createApp: builder.mutation({
      query: (app) => ({ url: 'admin/apps', method: 'POST', body: app }),
      onQueryStarted: applyToCachedApps((draft, saved) => {
        draft.unshift(saved);
      }),
      invalidatesTags: ['Apps'],
    }),
    updateApp: builder.mutation({
      query: ({ id, ...changes }) => ({ url: `admin/apps/${id}`, method: 'PATCH', body: changes }),
      onQueryStarted: applyToCachedApps((draft, saved) => {
        const index = draft.findIndex((app) => app.id === saved.id);
        if (index !== -1) draft[index] = saved;
      }),
      invalidatesTags: ['Apps'],
    }),
    deleteApp: builder.mutation({
      query: (id) => ({ url: `admin/apps/${id}`, method: 'DELETE' }),
      onQueryStarted: applyToCachedApps((draft, _result, id) => draft.filter((app) => app.id !== id)),
      invalidatesTags: ['Apps'],
    }),
    reorderApps: builder.mutation({
      query: (ids) => ({ url: 'admin/apps/order', method: 'PUT', body: { ids } }),
      // Reorder the cached list straight away so the table doesn't jump.
      async onQueryStarted(ids, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          api.util.updateQueryData('getApps', undefined, (draft) => {
            const byId = new Map(draft.map((app) => [app.id, app]));
            return ids.map((id) => byId.get(id));
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['Apps'],
    }),
    uploadIcon: builder.mutation({
      query: (file) => {
        const body = new FormData();
        body.append('icon', file);
        return { url: 'admin/upload', method: 'POST', body };
      },
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useCreateAppMutation,
  useUpdateAppMutation,
  useDeleteAppMutation,
  useReorderAppsMutation,
  useUploadIconMutation,
} = adminApi;

/** Pulls a readable message out of an RTK Query error. */
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  error?.data?.error ?? (error?.status === 'FETCH_ERROR' ? 'Cannot reach the server.' : fallback);
