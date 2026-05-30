import { Helmet } from 'react-helmet-async';

const APP_NAME = 'BlogSpace';

const PageMeta = ({
  title,
  description,
  image,
  url,
  type = 'website',
  noIndex = false,
}) => {
  const pageTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;
  const metaDescription =
    description || 'Discover and share stories on BlogSpace — a modern blogging platform.';

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      {noIndex && <meta name="robots" content="noindex" />}

      <meta property="og:site_name" content={APP_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default PageMeta;
