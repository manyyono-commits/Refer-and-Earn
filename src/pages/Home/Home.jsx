import Seo from '../../components/common/Seo';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { useGetSiteContentQuery } from '../../services/api';
import Hero from './sections/Hero';
import GamesSection from './sections/GamesSection';
import FeaturedApps from './sections/FeaturedApps';
import Tips from './sections/Tips';
import Community from './sections/Community';
import DisclaimerNotice from './sections/DisclaimerNotice';
import StateAlert from './sections/StateAlert';
import PromoBanner from './sections/PromoBanner';
import AboutBlock from './sections/AboutBlock';

export default function Home() {
  const { data: site, isLoading, isError, refetch } = useGetSiteContentQuery();

  if (isLoading) return <Loader />;
  if (isError || !site) {
    return (
      <div className="container" style={{ paddingTop: 24 }}>
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  const { home } = site;

  return (
    <>
      <Seo />
      <div className="container">
        <Hero title={home.heroTitle} text={home.heroText} />
        <GamesSection title={home.gamesTitle} />
        <FeaturedApps content={home.featured} />
        <Tips content={home.tips} />
        <Community content={home.community} telegramUrl={site.telegramUrl} />
        <DisclaimerNotice text={home.disclaimer} />
        <StateAlert content={home.stateAlert} />
        <PromoBanner text={home.promo} />
        <AboutBlock content={home.about} />
      </div>
    </>
  );
}
