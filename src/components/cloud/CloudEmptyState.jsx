import { Inbox } from "lucide-react";

import CloudButton from "./CloudButton";

export default function CloudEmptyState({
  icon: Icon = Inbox,
  title = "Nenhum registro encontrado",
  description = "Ainda não existem informações para mostrar.",
  actionLabel,
  actionIcon,
  onAction,
}) {
  return (
    <div className="cf-cloud-empty-state">
      <span className="cf-cloud-empty-state-icon">
        <Icon size={34} />
      </span>

      <h3>{title}</h3>

      <p>{description}</p>

      {actionLabel && (
        <CloudButton
          icon={actionIcon}
          onClick={onAction}
        >
          {actionLabel}
        </CloudButton>
      )}
    </div>
  );
}