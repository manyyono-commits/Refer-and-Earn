import { Helmet } from 'react-helmet-async';
import { useGetSiteContentQuery } from '../../services/api';

export default function Seo({ title, description, noindex = false }) {
  const { data: site } = useGetSiteContentQuery();
  const siteName = site?.siteName ?? 'All New Apps';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const desc = description ?? site?.metaDescription;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
