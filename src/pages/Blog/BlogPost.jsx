import { lazy } from 'react';
import { useParams } from 'react-router-dom';
import PageSeo from '../../components/common/PageSeo';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { useGetPostQuery } from '../../services/api';
import { postSeo } from '../../../shared/seo/pages';
import PostView from './PostView';

const NotFound = lazy(() => import('../NotFound/NotFound'));

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, isLoading, isError, error, refetch } = useGetPostQuery(slug);

  if (isLoading) return <Loader />;
  if (error?.status === 404) return <NotFound />;
  if (isError || !post) {
    return (
      <div className="container" style={{ paddingTop: 24 }}>
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  return (
    <>
      <PageSeo seo={postSeo(post)} />
      <PostView post={post} />
    </>
  );
}
