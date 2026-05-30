import { Link } from 'react-router-dom';
import PageMeta from '../components/seo/PageMeta.jsx';
import { ROUTES } from '../utils/constants.js';

const NotFound = () => {
  return (
    <section className="not-found-page">
      <PageMeta
        title="Page Not Found"
        description="The page you are looking for does not exist."
        noIndex
      />
      <span className="not-found-page__code" aria-hidden="true">
        404
      </span>
      <h1>Page not found</h1>
      <p className="text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link to={ROUTES.HOME} className="btn btn--primary">
        Back to Home
      </Link>
    </section>
  );
};

export default NotFound;
