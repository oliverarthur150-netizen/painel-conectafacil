import { LoaderCircle } from "lucide-react";

export default function CloudButton({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  onClick,
  title,
}) {
  const classes = [
    "cf-cloud-button",
    `cf-cloud-button-${variant}`,
    `cf-cloud-button-${size}`,
    fullWidth ? "cf-cloud-button-full" : "",
    loading ? "cf-cloud-button-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const estaDesabilitado = disabled || loading;

  return (
    <button
      type={type}
      className={classes}
      disabled={estaDesabilitado}
      onClick={onClick}
      title={title}
    >
      {loading && (
        <LoaderCircle
          size={18}
          className="cf-cloud-button-spinner"
        />
      )}

      {!loading && Icon && iconPosition === "left" && (
        <Icon size={18} />
      )}

      <span>{children}</span>

      {!loading && Icon && iconPosition === "right" && (
        <Icon size={18} />
      )}
    </button>
  );
}