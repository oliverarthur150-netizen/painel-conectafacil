import { LoaderCircle } from "lucide-react";

export default function CloudLoading({
  title = "Carregando informações",
  description = "Aguarde enquanto os dados são preparados.",
  compact = false,
}) {
  return (
    <div
      className={`cf-cloud-loading ${
        compact ? "cf-cloud-loading-compact" : ""
      }`}
    >
      <span className="cf-cloud-loading-icon">
        <LoaderCircle size={27} />
      </span>

      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}