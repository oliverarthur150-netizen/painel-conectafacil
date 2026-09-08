const statusConfig = {
  online: {
    label: "Online",
    className: "online",
  },

  offline: {
    label: "Offline",
    className: "offline",
  },

  warning: {
    label: "Atenção",
    className: "warning",
  },

  pending: {
    label: "Pendente",
    className: "pending",
  },

  active: {
    label: "Ativo",
    className: "active",
  },

  inactive: {
    label: "Inativo",
    className: "inactive",
  },

  paid: {
    label: "Pago",
    className: "paid",
  },

  overdue: {
    label: "Atrasado",
    className: "overdue",
  },
};

export default function CloudStatus({
  status = "active",
  label,
  showDot = true,
  className = "",
}) {
  const config =
    statusConfig[status] || statusConfig.active;

  const classes = [
    "cf-cloud-status",
    `cf-cloud-status-${config.className}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {showDot && <i />}

      <span>{label || config.label}</span>
    </span>
  );
}