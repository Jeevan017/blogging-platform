import Loader from './Loader.jsx';

const PageFallback = ({ label = 'Loading page...' }) => {
  return (
    <div className="page-fallback">
      <Loader label={label} />
    </div>
  );
};

export default PageFallback;
