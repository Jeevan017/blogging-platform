const EmptyState = ({ icon = '📝', title, description, action }) => {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state__icon" aria-hidden="true">
        {icon}
      </span>
      {title && <h2 className="empty-state__title">{title}</h2>}
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
};

export default EmptyState;
