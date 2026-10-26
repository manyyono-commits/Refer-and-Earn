import Seo from '../../components/common/Seo';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { useGetSiteContentQuery } from '../../services/api';
import Hero from './sections/Hero';
import GamesSection from './sections/GamesSection';
import FeaturedApps from './sections/FeaturedApps';
import ExploreInfo from './sections/ExploreInfo';
import VerifyApp from './sections/VerifyApp';
import AppFeatures from './sections/AppFeatures';
import ApkSafety from './sections/ApkSafety';
import PrivacySecurity from './sections/PrivacySecurity';
import Faq from './sections/Faq';
import AboutBlock from './sections/AboutBlock';
import DisclaimerNotice from './sections/DisclaimerNotice';
import StateAlert from './sections/StateAlert';

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
        {/* H1: Yono Games: App Information, Features and User Guide */}
        <Hero title={home.heroTitle} />

        {/* H2: Explore Yono Games and App Information (+ App Cards) */}
        <GamesSection title={home.gamesTitle} />

        {/* H2: Featured Apps (kept from existing design) */}
        <FeaturedApps content={home.featured} />

        {/* H2: Explore Yono Games and App Information */}
        <ExploreInfo />

        {/* H2: How to Verify a Gaming App Before Installing */}
        <VerifyApp />

        {/* H2: App Features and Device Compatibility */}
        <AppFeatures />

        {/* H2: Understanding APK Files and Installation Safety */}
        <ApkSafety />

        {/* H2: Privacy and Security Considerations */}
        <PrivacySecurity />

        {/* Disclaimer & State Alert (kept from existing design) */}
        <DisclaimerNotice text={home.disclaimer} />
        <StateAlert content={home.stateAlert} />

        {/* H2: Frequently Asked Questions About Yono Games */}
        <Faq />

        {/* H2: About ManyYonoGames.com */}
        <AboutBlock />
      </div>
    </>
  );
}
