const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader__spinner" aria-hidden="true" />
      <span className="loader__label">{label}</span>
    </div>
  );
};

export default Loader;
