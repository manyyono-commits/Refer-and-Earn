import { Helmet } from 'react-helmet-async';

/** Full SEO <head> for an article page, from a shared/seo/pages.js entry. */
export default function PageSeo({ seo }) {
  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}
      <meta name="robots" content={seo.robots} />
      <meta name="author" content={seo.author} />
      <link rel="canonical" href={seo.canonical} />
      <meta property="og:type" content={seo.og.type} />
      <meta property="og:title" content={seo.og.title} />
      <meta property="og:description" content={seo.og.description} />
      <meta property="og:url" content={seo.og.url} />
      <meta property="og:site_name" content={seo.og.siteName} />
      <meta property="og:locale" content={seo.og.locale} />
      <meta property="og:image" content={seo.og.image} />
      <meta property="og:image:alt" content={seo.og.imageAlt} />
      {seo.og.section && <meta property="article:section" content={seo.og.section} />}
      {seo.og.publishedTime && <meta property="article:published_time" content={seo.og.publishedTime} />}
      {seo.og.modifiedTime && <meta property="article:modified_time" content={seo.og.modifiedTime} />}
      <meta name="twitter:card" content={seo.twitter.card} />
      <meta name="twitter:title" content={seo.twitter.title} />
      <meta name="twitter:description" content={seo.twitter.description} />
      <meta name="twitter:image" content={seo.twitter.image} />
      <meta name="twitter:image:alt" content={seo.twitter.imageAlt} />
      <script type="application/ld+json">{JSON.stringify(seo.jsonLd)}</script>
    </Helmet>
  );
}
