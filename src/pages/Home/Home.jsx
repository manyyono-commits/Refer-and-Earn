import { Helmet } from 'react-helmet-async';
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
import Faq, { FAQS } from './sections/Faq';
import AboutBlock from './sections/AboutBlock';
import DisclaimerNotice from './sections/DisclaimerNotice';
import StateAlert from './sections/StateAlert';

const HOME_TITLE = 'Yono Games | App Information & Safety Guide | ManyYonoGames';
const HOME_DESCRIPTION =
  'Explore Yono Games, Yono777, Yonorummy and Jaiho777 app information, verified features, device compatibility, version details and safety guidance.';

// Organization / WebSite / WebPage JSON-LD lives in index.html; FAQPage is homepage-only.
const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://manyyonogames.com/#faq',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

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
      <Helmet>
        <title>{HOME_TITLE}</title>
        <meta name="description" content={HOME_DESCRIPTION} />
        <script type="application/ld+json">{JSON.stringify(FAQ_JSON_LD)}</script>
      </Helmet>
      <div className="container">
        {/* H1: Yono Games: App Information, Features and User Guide */}
        <Hero title={home.heroTitle} />

        {/* H2: Explore Yono Games and App Information, followed by the app cards (H3) */}
        <ExploreInfo />
        <GamesSection title={home.gamesTitle} />

        {/* H3: Featured Apps (kept from existing design) */}
        <FeaturedApps content={home.featured} />

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
