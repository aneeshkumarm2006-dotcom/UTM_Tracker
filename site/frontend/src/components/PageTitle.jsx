import { Helmet } from 'react-helmet-async';

/**
 * Sets <title> and <meta name="description"> for the current page.
 * Usage: <PageTitle title="Overview" description="..." />
 */
export default function PageTitle({ title, description }) {
  const fullTitle = title ? `${title} — trackUTM` : 'trackUTM — UTM Conversion Tracker';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
}
