export default function CloudSectionTitle({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
  className = "",
}) {
  const classes = [
    "cf-cloud-section-title",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="cf-cloud-section-title-main">
        {Icon && (
          <span className="cf-cloud-section-title-icon">
            <Icon size={23} />
          </span>
        )}

        <div>
          {eyebrow && (
            <span className="cf-cloud-section-eyebrow">
              {eyebrow}
            </span>
          )}

          <h1>{title}</h1>

          {description && <p>{description}</p>}
        </div>
      </div>

      {action && (
        <div className="cf-cloud-section-title-action">
          {action}
        </div>
      )}
    </div>
  );
}