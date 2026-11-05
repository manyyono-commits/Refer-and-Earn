// SEO metadata for the article pages.
// Shared by the React pages (client-side <head>) and the Express server, which
// writes these tags into index.html so crawlers see them without running JS.

export const SITE_URL = 'https://manyyonogames.com';
const SITE_NAME = 'Many Yono Games';
const DEFAULT_IMAGE = `${SITE_URL}/images/logo.jpeg`;

/**
 * Builds the SEO object (meta tags + JSON-LD) for one page.
 * `schemaType` is the main entity: Article, BlogPosting or CollectionPage.
 */
export function buildSeo({
  path,
  title,
  description,
  keywords = '',
  ogTitle = title,
  ogDescription = description,
  twitterTitle = ogTitle,
  twitterDescription = ogDescription,
  image = DEFAULT_IMAGE,
  imageAlt = title,
  breadcrumbName = title,
  breadcrumbParents = [],
  articleKeywords = [],
  published,
  modified = published,
  schemaType = 'Article',
  authorName = SITE_NAME,
  canonical,
  noindex = false,
  faqs = [],
}) {
  const url = `${SITE_URL}${path}`;
  const isArticle = schemaType !== 'CollectionPage';
  const absImage = image?.startsWith('/') ? `${SITE_URL}${image}` : image || DEFAULT_IMAGE;
  const seo = {
    path,
    title,
    description,
    keywords,
    robots: noindex
      ? 'noindex, follow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    canonical: canonical || url,
    author: authorName,
    og: {
      type: isArticle ? 'article' : 'website',
      title: ogTitle,
      description: ogDescription,
      url,
      siteName: SITE_NAME,
      locale: 'en_IN',
      image: absImage,
      imageAlt,
      section: isArticle ? 'Yono Games' : undefined,
      publishedTime: isArticle ? published : undefined,
      modifiedTime: isArticle ? modified : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      image: absImage,
      imageAlt,
    },
  };

  const crumbs = [{ name: 'Home', item: `${SITE_URL}/` }, ...breadcrumbParents, { name: breadcrumbName, item: url }];
  const main = isArticle
    ? {
        '@type': schemaType,
        '@id': `${url}#article`,
        mainEntityOfPage: { '@id': `${url}#webpage` },
        headline: title,
        description,
        image: { '@type': 'ImageObject', url: absImage },
        author:
          authorName === SITE_NAME
            ? { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` }
            : { '@type': 'Person', name: authorName },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
        datePublished: published,
        dateModified: modified,
        inLanguage: 'en-IN',
        articleSection: 'Yono Games',
        ...(articleKeywords.length && { keywords: articleKeywords }),
      }
    : null;

  seo.jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        inLanguage: 'en-IN',
      },
      {
        '@type': isArticle ? 'WebPage' : 'CollectionPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        inLanguage: 'en-IN',
        breadcrumb: { '@id': `${url}#breadcrumb` },
        ...(main && { mainEntity: { '@id': `${url}#article` } }),
      },
      ...(main ? [main] : []),
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })),
      },
      ...(faqs.length
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${url}#faq`,
              mainEntity: faqs.map(({ q, a }) => ({
                '@type': 'Question',
                name: q,
                acceptedAnswer: { '@type': 'Answer', text: a },
              })),
            },
          ]
        : []),
    ],
  };

  return seo;
}

/** Old fixed article URLs → their blog posts (301 on the server, <Navigate> in the app). */
export const LEGACY_REDIRECTS = {
  '/yono-games-apk-download/': '/blog/yono-games-apk-download/',
  '/all-yono-games/': '/blog/all-yono-games/',
  '/yono-vip-games-for-android-download/': '/blog/yono-vip-games-for-android-download/',
};

export const blogIndexSeo = buildSeo({
  path: '/blog/',
  title: 'Yono Games Blog – Guides, App Information & Safety Tips | Many Yono Games',
  description:
    'Read the latest Many Yono Games blog posts: Yono app guides, Android APK installation help, Rummy game basics and safety tips.',
  keywords: 'Yono Games blog, Yono apps guide, Yono APK guide, Rummy games India, Yono games news',
  breadcrumbName: 'Blog',
  schemaType: 'CollectionPage',
});

/** Fixed pages whose SEO tags the server writes into the HTML. */
export const SEO_PAGES = [blogIndexSeo];

/** SEO for a blog post document (from the database). */
export function postSeo(post) {
  const s = post.seo ?? {};
  const title = s.title || post.title;
  const description = s.description || post.excerpt || '';
  return buildSeo({
    path: `/blog/${post.slug}/`,
    title,
    description,
    keywords: s.keywords || (post.tags ?? []).join(', '),
    ogTitle: s.ogTitle || title,
    ogDescription: s.ogDescription || description,
    twitterTitle: s.twitterTitle || s.ogTitle || title,
    twitterDescription: s.twitterDescription || s.ogDescription || description,
    image: s.ogImage || post.coverImage || undefined,
    imageAlt: post.coverImageAlt || post.title,
    breadcrumbName: post.title,
    breadcrumbParents: [{ name: 'Blog', item: `${SITE_URL}/blog/` }],
    articleKeywords: post.tags ?? [],
    published: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    modified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    schemaType: 'BlogPosting',
    authorName: post.author || undefined,
    canonical: s.canonical || undefined,
    noindex: Boolean(s.noindex),
    faqs: post.faqs ?? [],
  });
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function headHtml(s) {
  const tags = [
    `<title>${esc(s.title)}</title>`,
    `<meta name="description" content="${esc(s.description)}" />`,
    `<meta name="robots" content="${esc(s.robots)}" />`,
    `<meta name="author" content="${esc(s.author)}" />`,
    `<link rel="canonical" href="${esc(s.canonical)}" />`,
    `<meta property="og:type" content="${esc(s.og.type)}" />`,
    `<meta property="og:title" content="${esc(s.og.title)}" />`,
    `<meta property="og:description" content="${esc(s.og.description)}" />`,
    `<meta property="og:url" content="${esc(s.og.url)}" />`,
    `<meta property="og:site_name" content="${esc(s.og.siteName)}" />`,
    `<meta property="og:locale" content="${esc(s.og.locale)}" />`,
    `<meta property="og:image" content="${esc(s.og.image)}" />`,
    `<meta property="og:image:alt" content="${esc(s.og.imageAlt)}" />`,
    s.og.section && `<meta property="article:section" content="${esc(s.og.section)}" />`,
    s.og.publishedTime && `<meta property="article:published_time" content="${esc(s.og.publishedTime)}" />`,
    s.og.modifiedTime && `<meta property="article:modified_time" content="${esc(s.og.modifiedTime)}" />`,
    s.keywords && `<meta name="keywords" content="${esc(s.keywords)}" />`,
    `<meta name="twitter:card" content="${esc(s.twitter.card)}" />`,
    `<meta name="twitter:title" content="${esc(s.twitter.title)}" />`,
    `<meta name="twitter:description" content="${esc(s.twitter.description)}" />`,
    `<meta name="twitter:image" content="${esc(s.twitter.image)}" />`,
    `<meta name="twitter:image:alt" content="${esc(s.twitter.imageAlt)}" />`,
    `<script type="application/ld+json">${JSON.stringify(s.jsonLd).replace(/</g, '\\u003c')}</script>`,
  ];
  return tags.filter(Boolean).join('\n    ');
}

/**
 * Replace the homepage SEO tags in index.html with a page's tags.
 * Strips the title, description, robots, canonical, og:*, twitter:* and
 * JSON-LD blocks, then inserts the page block before </head>.
 */
export function applyPageHead(html, seo) {
  const stripped = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="(description|keywords|robots|author)"[\s\S]*?\/?>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[\s\S]*?\/?>/gi, '')
    .replace(/<meta\s+property="(og|article):[^"]*"[\s\S]*?\/?>/gi, '')
    .replace(/<link\s+rel="canonical"[\s\S]*?\/?>/gi, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
  return stripped.replace('</head>', `    ${headHtml(seo)}\n  </head>`);
}
