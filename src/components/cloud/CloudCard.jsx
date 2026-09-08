export default function CloudCard({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  variant = "default",
  padding = "normal",
  hover = false,
  className = "",
}) {
  const classes = [
    "cf-cloud-card",
    `cf-cloud-card-${variant}`,
    `cf-cloud-card-padding-${padding}`,
    hover ? "cf-cloud-card-hover" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes}>
      {(title || subtitle || Icon || action) && (
        <header className="cf-cloud-card-header">
          <div className="cf-cloud-card-heading">
            {Icon && (
              <span className="cf-cloud-card-header-icon">
                <Icon size={20} />
              </span>
            )}

            <div>
              {title && <h3>{title}</h3>}
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>

          {action && (
            <div className="cf-cloud-card-action">
              {action}
            </div>
          )}
        </header>
      )}

      <div className="cf-cloud-card-content">
        {children}
      </div>
    </article>
  );
}