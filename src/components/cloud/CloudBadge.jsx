export default function CloudBadge({
  children,
  variant = "neutral",
  icon: Icon,
  pulse = false,
  className = "",
}) {
  const classes = [
    "cf-cloud-badge",
    `cf-cloud-badge-${variant}`,
    pulse ? "cf-cloud-badge-pulse" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {pulse && <i className="cf-cloud-badge-dot" />}

      {!pulse && Icon && <Icon size={14} />}

      <span>{children}</span>
    </span>
  );
}