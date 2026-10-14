import { useParams } from 'react-router-dom';
import Seo from '../../components/common/Seo';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { useGetAppBySlugQuery, useGetSiteContentQuery } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import NotFound from '../NotFound/NotFound';
import DetailHero from './sections/DetailHero';
import StatsGrid from './sections/StatsGrid';
import CardGrid from './sections/CardGrid';
import Reviews from './sections/Reviews';
import Faq from './sections/Faq';
import MoreApps from './sections/MoreApps';
import { FaListOl, FaShieldAlt, FaUserShield } from 'react-icons/fa';

export default function AppDetail() {
  const { slug } = useParams();
  const { data: app, isLoading, isError, refetch } = useGetAppBySlugQuery(slug);
  const { data: site, isLoading: siteLoading } = useGetSiteContentQuery();

  if (isLoading || siteLoading) return <Loader />;
  if (isError) {
    return (
      <div className="container" style={{ paddingTop: 24 }}>
        <ErrorState onRetry={refetch} />
      </div>
    );
  }
  if (!app) return <NotFound />;

  const detail = site?.detail ?? {};

  return (
    <>
      <Seo
        title={`${app.name} – Download & Sign Up Bonus ${formatCurrency(app.bonus)}`}
        description={app.description}
      />
      <div className="container-wide">
        <DetailHero app={app} />
        <StatsGrid app={app} />
        {detail.steps && (
          <CardGrid title={`How to Install ${app.name}`} icon={FaListOl} items={detail.steps} numbered />
        )}
        {detail.trust && <CardGrid title="Why Trust This Listing" icon={FaShieldAlt} items={detail.trust} />}
        {detail.security && (
          <CardGrid title="Stay Safe While Playing" icon={FaUserShield} items={detail.security} />
        )}
        {detail.reviews && <Reviews reviews={detail.reviews} />}
        {detail.faq && <Faq items={detail.faq} />}
        <MoreApps currentSlug={app.slug} />
      </div>
    </>
  );
}
