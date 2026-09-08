const cards = [
  {
    titulo: "TVs Online",
    valor: "18",
    detalhe: "2 offline",
    icone: "📺",
    classe: "azul",
  },
  {
    titulo: "Clientes",
    valor: "11",
    detalhe: "1 novo este mês",
    icone: "👥",
    classe: "roxo",
  },
  {
    titulo: "Campanhas",
    valor: "327",
    detalhe: "32 ativas",
    icone: "📢",
    classe: "laranja",
  },
  {
    titulo: "Receita mensal",
    valor: "R$ 12.850",
    detalhe: "+8,4% neste mês",
    icone: "💰",
    classe: "verde",
  },
];

export default function ResumoCards() {
  return (
    <section className="dashboard-resumo-grid">
      {cards.map((card) => (
        <article
          key={card.titulo}
          className={`dashboard-resumo-card ${card.classe}`}
        >
          <div className="dashboard-resumo-topo">
            <span className="dashboard-resumo-icone">
              {card.icone}
            </span>

            <span className="dashboard-resumo-menu">
              •••
            </span>
          </div>

          <strong className="dashboard-resumo-valor">
            {card.valor}
          </strong>

          <span className="dashboard-resumo-titulo">
            {card.titulo}
          </span>

          <small className="dashboard-resumo-detalhe">
            {card.detalhe}
          </small>
        </article>
      ))}
    </section>
  );
}