const Skeleton = ({ className = '', width, height, rounded = false }) => {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <span
      className={`skeleton ${rounded ? 'skeleton--rounded' : ''} ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
