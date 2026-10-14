import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Loader from '../../../components/common/Loader';
import { useGetAppsQuery } from '../../../services/api';
import { getErrorMessage, useCreateAppMutation, useUpdateAppMutation } from '../../../services/adminApi';
import AppForm from './AppForm';
import { EMPTY_APP } from './emptyApp';
import styles from '../Admin.module.css';

// Number fields are edited as strings; everything else passes through.
const toFormValues = (app) => ({
  ...EMPTY_APP,
  ...app,
  bonus: String(app.bonus ?? ''),
  minWithdraw: String(app.minWithdraw ?? ''),
  rating: String(app.rating ?? ''),
  downloadUrl: app.downloadUrl === '#' ? '' : app.downloadUrl,
});

export default function AppFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { app, isLoading } = useGetAppsQuery(undefined, {
    skip: !isEdit,
    selectFromResult: ({ data, isLoading: loading }) => ({
      app: data?.find((a) => a.id === id),
      isLoading: loading,
    }),
  });

  const [createApp, createState] = useCreateAppMutation();
  const [updateApp, updateState] = useUpdateAppMutation();
  const { isLoading: isSubmitting, error } = isEdit ? updateState : createState;

  const handleSubmit = async (payload) => {
    const saved = isEdit
      ? await updateApp({ id, ...payload }).unwrap()
      : await createApp(payload).unwrap();
    navigate('/admin', {
      state: { flash: { type: 'success', text: `"${saved.name}" was ${isEdit ? 'updated' : 'added'}.` } },
    });
  };

  if (isEdit && isLoading) return <Loader />;

  if (isEdit && !app) {
    return (
      <div className={styles.empty}>
        This app no longer exists. <Link to="/admin">Back to listings</Link>
      </div>
    );
  }

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <Link to="/admin" className={styles.backLink}>
            <FaArrowLeft aria-hidden="true" /> All listings
          </Link>
          <h1>{isEdit ? `Edit ${app.name}` : 'Add New App'}</h1>
        </div>
      </div>

      <AppForm
        key={app?.id ?? 'new'}
        initialValues={isEdit ? toFormValues(app) : EMPTY_APP}
        submitLabel={isEdit ? 'Save changes' : 'Add app'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverError={error ? getErrorMessage(error) : null}
      />
    </>
  );
}
