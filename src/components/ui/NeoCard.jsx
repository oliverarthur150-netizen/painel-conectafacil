export default function NeoCard({
  children,
  className = "",
  destaque = "azul",
}) {
  return (
    <section
      className={`neo-card neo-card-${destaque} ${className}`}
    >
      <div className="neo-card-brilho" />

      <div className="neo-card-conteudo">
        {children}
      </div>
    </section>
  );
}