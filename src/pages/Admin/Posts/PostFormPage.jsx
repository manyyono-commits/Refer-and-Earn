import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Loader from '../../../components/common/Loader';
import ErrorState from '../../../components/common/ErrorState';
import {
  getErrorMessage,
  useCreatePostMutation,
  useGetAdminPostQuery,
  useUpdatePostMutation,
} from '../../../services/adminApi';
import PostForm, { EMPTY_POST, toLocalInput } from './PostForm';
import styles from '../Admin.module.css';

const toFormValues = (post) => ({
  ...EMPTY_POST,
  ...post,
  tags: (post.tags ?? []).join(', '),
  faqs: post.faqs ?? [],
  publishedAt: toLocalInput(post.publishedAt),
  seo: { ...EMPTY_POST.seo, ...post.seo },
});

export default function PostFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: post, isLoading, isError, error: loadError, refetch } = useGetAdminPostQuery(id, {
    skip: !isEdit,
    refetchOnMountOrArgChange: true,
  });
  const [createPost, createState] = useCreatePostMutation();
  const [updatePost, updateState] = useUpdatePostMutation();
  const { isLoading: isSubmitting, error } = isEdit ? updateState : createState;

  const handleSubmit = async (payload) => {
    const saved = isEdit ? await updatePost({ id, ...payload }).unwrap() : await createPost(payload).unwrap();
    const verb = saved.status === 'published' ? 'published' : 'saved as a draft';
    navigate('/admin/posts', { state: { flash: { type: 'success', text: `"${saved.title}" was ${verb}.` } } });
  };

  if (isEdit && isLoading) return <Loader />;
  if (isEdit && loadError?.status === 404) {
    return (
      <div className={styles.empty}>
        This post no longer exists. <Link to="/admin/posts">Back to posts</Link>
      </div>
    );
  }
  if (isEdit && (isError || !post)) return <ErrorState onRetry={refetch} />;

  const live = post?.status === 'published' && new Date(post.publishedAt) <= new Date();

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <Link to="/admin/posts" className={styles.backLink}>
            <FaArrowLeft aria-hidden="true" /> All posts
          </Link>
          <h1>{isEdit ? `Edit: ${post.title}` : 'New Blog Post'}</h1>
        </div>
      </div>

      <PostForm
        key={post?.id ?? 'new'}
        isEdit={isEdit}
        initialValues={isEdit ? toFormValues(post) : EMPTY_POST}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverError={error ? getErrorMessage(error) : null}
        viewUrl={live ? `/blog/${post.slug}/` : null}
      />
    </>
  );
}
